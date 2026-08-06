import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import paymentRoutes from "./routes/payment.routes.js";
import { connectProducer } from "@localmart/shared";

const app = express();
const port = process.env.PORT || 3005;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/payments", paymentRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🚀 Payment Service Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const startServer = async () => {
  await connectDB();
  
  try {
    await connectProducer();
    console.log("🚀 Kafka Producer Connected");
  } catch (err) {
    console.error("❌ Kafka Producer Failed:", err.message);
  }

  app.listen(port, () => {
    console.log(`🚀 Payment Service running on port ${port}`);
  });
};

startServer();
