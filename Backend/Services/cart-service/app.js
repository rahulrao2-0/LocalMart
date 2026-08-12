import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cartRoutes from './routes/cartRoutes.js';
import { errorHandler } from '@localmart/shared';

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    credentials: true
}));
app.use(express.json());

app.use('/cart', cartRoutes);
app.use('/api/v1/cart', cartRoutes);

app.use(errorHandler);

export default app;
