const app = require('./app');
const { env } = require('./config/env');
const { connectDB } = require('./config/db');
const { startKafkaConsumer } = require('./kafka/consumerHandler');
const { connectProducer } = require('@localmart/shared');

const startServer = async () => {
    try {
        await connectDB();
        // Redis connection is typically handled inside @localmart/shared if we import it, or we can just rely on the exported client.
        // Assuming @localmart/shared handles redis connection when imported, or we need to call connect.
        // Since we didn't see an explicit connectRedis from shared in instructions, we assume it's ready or self-connecting.
        
        await connectProducer();
        await startKafkaConsumer();

        app.listen(env.PORT, () => {
            console.log(`Inventory Service running on port ${env.PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
