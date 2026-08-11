import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { connectDB } from './config/db.js';
import notificationRoutes from './routes/notification.routes.js';
import { errorHandler } from './utils/errorHandler.js';
import { init as initSocket } from './services/socket.service.js';
import { startConsumer } from './kafka/consumer.js';

import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Database
connectDB();

// Initialize Socket.io
initSocket(httpServer);

import { initTopics, TOPICS } from "@localmart/shared";

const startServer = async () => {
    try {
        await initTopics(Object.values(TOPICS));
        console.log("✅ Kafka Topics Initialized");
    } catch (err) {
        console.error("⚠️ Failed to init topics:", err.message);
    }
    
    // Initialize Kafka Consumer
    startConsumer();
};

startServer();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5003;

httpServer.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
});
