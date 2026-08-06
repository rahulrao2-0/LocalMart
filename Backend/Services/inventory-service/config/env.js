import dotenv from 'dotenv';
dotenv.config();

const env = {
    PORT: process.env.PORT || 3003,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/localmart_inventory',
    REDIS_URI: process.env.REDIS_URI || 'redis://localhost:6379',
    KAFKA_BROKERS: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    KAFKA_CLIENT_ID: 'inventory-service',
};

export { env };
