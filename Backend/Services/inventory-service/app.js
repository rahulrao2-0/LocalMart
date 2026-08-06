
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const inventoryRoutes = require('./routes/inventory.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/inventory', inventoryRoutes);

app.use(errorHandler);

module.exports = app;
