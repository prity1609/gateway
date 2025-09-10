// src/config/redis.ts
import { createClient, RedisClientType } from 'redis';
import { env } from './environment.js';

const redisClient: RedisClientType = createClient({
  url: env.REDIS_URL,
});

redisClient.on('error', (err: Error) => console.error('Redis Client Error:', err));

// Connect to Redis
(async () => {
  await redisClient.connect();
  console.log('Connected to Redis');
})();

export default redisClient;
