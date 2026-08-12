import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import connectDB from './config/db.js';
import { connectProducer } from '@localmart/shared';
import { runConsumer } from './kafka/consumer.js';

const startServer = async () => {
    try {
        await connectDB();
        console.log('✅ MongoDB connected for Cart Service');
    } catch (err) {
        console.error('❌ Failed to connect MongoDB for Cart Service:', err.message);
    }

    try {
        await connectProducer();
        await runConsumer();
        console.log('✅ Kafka Consumer & Producer connected for Cart Service');
    } catch (err) {
        console.warn('⚠️ Kafka connection issue in Cart Service, HTTP server running anyway:', err.message);
    }
    
    const PORT = process.env.PORT || 3006;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Cart Service running on port ${PORT}`);
    });
};

startServer();
