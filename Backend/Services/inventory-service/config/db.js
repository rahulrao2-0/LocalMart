const mongoose = require('mongoose');
const { env } = require('./env');

const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected for Inventory Service');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = { connectDB };
