// config/redis.js
const { createClient } = require('redis');

let client;         // singleton
let readyPromise;   // نحتفظ بوعد الاتصال

function getRedis() {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on('error', (e) => console.error('🔴 Redis error:', e));
    readyPromise = client.connect();
    console.log('🟢 New Redis client created and connecting...');
}
  return { client, ready: readyPromise };
}

module.exports = getRedis;
