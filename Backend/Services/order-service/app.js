import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import orderRoutes from "./routes/order.routes.js";
import { connectProducer } from "@localmart/shared";

const app = express();
const port = process.env.PORT || 3004;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/orders", orderRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🚀 Order Service Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

import { connectPaymentConsumer } from "./events/paymentConsumer.js";

const startServer = async () => {
  await connectDB();
  
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
