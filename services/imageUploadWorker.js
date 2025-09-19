require('dotenv').config();
const getRedis = require('../config/redis');
const { Worker, isMainThread } = require('worker_threads');
const path = require('path');
const fsp = require('fs').promises;
const sharp = require('sharp');

const IMAGE_PROCESSING_CHANNEL = 'image-processing-channel';
const IMAGE_PROGRESS_CHANNEL   = 'image-progress-channel';

const MAX_CONCURRENCY = 2; // limit
let inFlight = 0;
const queue = [];

async function main() {
  const { client: base, ready } = getRedis();
  await ready;

  const sub = base.duplicate();
  const pub = base.duplicate();
  await sub.connect();
  await pub.connect();

  async function publish(obj) {
    await pub.publish(IMAGE_PROGRESS_CHANNEL, JSON.stringify(obj));
  }

  async function runWithRetries(fn, retries = 2, delayMs = 300) {
    let lastErr;
    for (let i = 0; i <= retries; i++) {
      try { return await fn(); } catch (e) {
        lastErr = e;
        if (i < retries) await new Promise(r => setTimeout(r, delayMs));
      }
    }
    throw lastErr;
  }

  async function processImage(imagePath, imageId, userId) {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const processedDir = path.join(uploadsDir, 'processed');
    await fsp.mkdir(processedDir, { recursive: true });

    const destFileName = path.basename(imagePath);
    const destPath = path.join(processedDir, destFileName);

    const step = async (name, pct, work) => {
      await publish({ userId, imageId, status: 'processing', step: name, progress: pct });
      return work();
    };

    try {
      await publish({ userId, imageId, status: 'processing', step: 'validate', progress: 5 });
      // basic validation: ensure readable and plausible size
      const stat = await runWithRetries(() => fsp.stat(imagePath));
      if (stat.size < 2 * 1024 * 1024 || stat.size > 10 * 1024 * 1024) {
        throw new Error('File size out of allowed range (2MB-10MB)');
      }

      const tmpPath = destPath + '.tmp';

      await step('decode', 15, async () => {
        await sharp(imagePath).metadata();
      });

      await step('resize-compress', 70, async () => {
        const pipeline = sharp(imagePath)
          .rotate()
          .resize({ width: 1600, withoutEnlargement: true })
          .jpeg({ quality: 80, mozjpeg: true });
        await runWithRetries(() => pipeline.toFile(tmpPath));
      });

      await step('write', 90, async () => {
        await runWithRetries(() => fsp.rename(tmpPath, destPath));
      });

      await step('cleanup', 98, async () => {
        await fsp.unlink(imagePath).catch(() => {});
      });

      const publicUrl = `/uploads/processed/${destFileName}`;
      await publish({ userId, imageId, status: 'completed', progress: 100, publicUrl });
      console.log(`[Worker] Image ${imageId} done -> ${publicUrl}`);
    } catch (e) {
      console.error('[Worker] Processing failed:', e);
      await publish({ userId, imageId, status: 'error', message: e?.message || String(e) });
    }
  }

  async function maybeRunNext() {
    if (inFlight >= MAX_CONCURRENCY) return;
    const next = queue.shift();
    if (!next) return;
    inFlight++;
    const { imagePath, imageId, userId } = next;
    try { await processImage(imagePath, imageId, userId); }
    finally { inFlight--; maybeRunNext(); }
  }

  if (isMainThread) {
    await sub.subscribe(IMAGE_PROCESSING_CHANNEL, (message) => {
      const payload = JSON.parse(message);
      queue.push(payload);
      maybeRunNext();
    });
    console.log(`[Worker] Listening on ${IMAGE_PROCESSING_CHANNEL}`);
  }
}

main().catch((e) => {
  console.error('Fatal img worker error:', e);
  process.exit(1);
});
