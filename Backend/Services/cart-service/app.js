import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cartRoutes from './routes/cartRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/cart', cartRoutes);

export default app;
