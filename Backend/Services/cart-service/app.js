require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/cart', cartRoutes);

module.exports = app;
