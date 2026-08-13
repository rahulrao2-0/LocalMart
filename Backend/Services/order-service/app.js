import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import orderRoutes from "./routes/order.routes.js";
const app = express();
const port = process.env.PORT || 3004;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Order flow debugging middleware
app.use((req, res, next) => {
  console.log(`[Order Flow Debug] Request Method: ${req.method}, URL: ${req.originalUrl}`);
  console.log(`[Order Flow Debug] Request Body:`, req.body);
  next();
});

app.use("/api/v1/orders", orderRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🚀 Order Service Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

import { connectProducer, initTopics, TOPICS } from "@localmart/shared";
import { connectPaymentConsumer } from "./events/paymentConsumer.js";

const startServer = async () => {
  await connectDB();
  
  try {
    await initTopics(Object.values(TOPICS));
    console.log("✅ Kafka Topics Initialized");
  } catch (err) {
    console.error("⚠️ Failed to init topics:", err.message);
  }

  try {
    await connectProducer();
    console.log("🚀 Kafka Producer Connected");
  } catch (err) {
    console.error("❌ Kafka Producer Failed:", err.message);
  }

  await connectPaymentConsumer();

  app.listen(port, () => {
    console.log(`🚀 Order Service running on port ${port}`);
  });
};

startServer();
