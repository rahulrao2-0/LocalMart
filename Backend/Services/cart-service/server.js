import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import connectDB from './config/db.js';
import { connectProducer, redis } from '@localmart/shared';
import { runConsumer } from './kafka/consumer.js';

const startServer = async () => {
    try {
        await connectDB();
        await connectProducer();
        await runConsumer();
        
        const PORT = process.env.PORT || 4003;
        app.listen(PORT, () => {
            console.log(`Cart Service running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
