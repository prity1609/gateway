// src/config/redis.js
import { createClient } from 'redis';
import { env } from './environment.js';

const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));

// Immediately connect
(async () => {
  await redisClient.connect();
})();

console.log('Successfully connected to Redis.');
export default redisClient;