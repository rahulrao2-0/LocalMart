import { createClient } from 'redis';

const redisClient = createClient();

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis Cache'));

// We connect immediately when this file is imported
await redisClient.connect().catch(console.error);

export default redisClient;
