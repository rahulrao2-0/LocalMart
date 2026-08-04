import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { connectDB } from './config/db.js';
import notificationRoutes from './routes/notification.routes.js';
import { errorHandler } from './utils/errorHandler.js';
import { init as initSocket } from './services/socket.service.js';
import { startConsumer } from './kafka/consumer.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Database
connectDB();

// Initialize Socket.io
initSocket(httpServer);

// Initialize Kafka Consumer
startConsumer();

app.use(cors());
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
