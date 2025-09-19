const getRedis = require('../config/redis');

async function processQueue() {
  console.log('👷‍Worker started, waiting for jobs in queue...');

  // خذ كلاينت أساس واعمِل دبلكات لاتصالين منفصلين
  const { client: base, ready } = getRedis();
  await ready;

  const queueConn = base.duplicate(); // للـ BRPOP (بلوكينغ)
  const pubConn   = base.duplicate(); // للـ PUBLISH

  await queueConn.connect();
  await pubConn.connect();

  while (true) {
    try {
      const { key, element } = await queueConn.brPop('notifications-queue', 0);
      console.log(`✅ Job from ${key}: ${element}`);

      await pubConn.publish('notifications:broadcast', element);

      await new Promise(r => setTimeout(r, 20));
    } catch (err) {
      console.error('🔴 Worker loop error:', err);
      await new Promise(r => setTimeout(r, 500));
    }
  }
}

processQueue().catch(e => {
  console.error('Fatal worker error:', e);
  process.exit(1);
});
