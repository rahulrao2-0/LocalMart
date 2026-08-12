
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import inventoryRoutes from './routes/inventory.routes.js';
import { errorHandler } from '@localmart/shared';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/inventory', inventoryRoutes);

app.use(errorHandler);

export default app;

