// controllers/image.controller.js
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const getRedis = require('../config/redis');
const { client: redisPub, ready } = getRedis();

const IMAGE_PROCESSING_CHANNEL = 'image-processing-channel';
const IMAGE_PROGRESS_CHANNEL = 'image-progress-channel';

const sseClients = {};

exports.handleSseProgress = (req, res) => {
    const { imageId } = req.params;
    const userId = req.session.user.id;
    const clientId = `${userId}-${imageId}`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients[clientId] = res;

    req.on('close', () => {
        delete sseClients[clientId];
    });
};

(async () => {
    try {
        await ready;
        const redisSub = redisPub.duplicate();
        await redisSub.connect();
        await redisSub.subscribe(IMAGE_PROGRESS_CHANNEL, (message) => {
            const data = JSON.parse(message);
            const clientId = `${data.userId}-${data.imageId}`;
            const client = sseClients[clientId];
            if (client) {
                client.write(`data: ${JSON.stringify(data)}\n\n`);
                if (data.status === 'completed' || data.status === 'error') {
                    client.end();
                    delete sseClients[clientId];
                }
            }
        });
    } catch (e) {
        console.error('Failed to initialize image progress subscriber:', e);
    }
})();

exports.uploadImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const minBytes = 2 * 1024 * 1024; // 2MB
    if (req.file.size < minBytes) {
        return res.status(400).json({ error: 'File too small. Minimum size is 2MB.' });
    }

    const userId = req.session.user.id;
    const imageId = uuidv4();

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const incomingDir = path.join(uploadsDir, 'incoming');
    try {
        await fsp.mkdir(incomingDir, { recursive: true });
        const originalName = req.file.originalname || `${imageId}.bin`;
        const diskFileName = `${imageId}-${originalName}`;
        const diskPath = path.join(incomingDir, diskFileName);
        await fsp.writeFile(diskPath, req.file.buffer);

        console.log(`[API] Received image ${originalName} from user ${userId}. Saved to ${diskPath}`);

        const payload = {
            imageId: imageId,
            imagePath: diskPath,
            userId: userId
        };

        await redisPub.publish(IMAGE_PROCESSING_CHANNEL, JSON.stringify(payload));

        res.status(202).json({
            message: 'Image upload received, processing in background.',
            imageId: imageId,
            sseUrl: `/upload/image-upload-progress/${imageId}`
        });
    } catch (e) {
        console.error('Failed to persist uploaded file:', e);
        return res.status(500).json({ error: 'Failed to save uploaded file' });
    }
};