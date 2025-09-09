// src/config/redis.js
import { createClient } from 'redis';
import { env } from './environment.js';

const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));

// Connect to Redis
(async () => {
  await redisClient.connect();
  console.log('Connected to Redis');
})();

export default redisClient;
