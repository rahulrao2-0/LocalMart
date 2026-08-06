require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { connectProducer, redis } = require('@localmart/shared');
const { runConsumer } = require('./kafka/consumer');

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
