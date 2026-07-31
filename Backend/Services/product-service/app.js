import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { configureCloudinary } from "./config/cloudinary.js";
import productRoutes from "./routes/product.routes.js";
import { connectProducer } from "@localmart/shared";

const app = express();
const port = process.env.PORT || 3003;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors()); // Allow internal requests from gateway

app.use("/api/v1/products", productRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("?? Product Service Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const startServer = async () => {
  await connectDB();
  configureCloudinary();
  
  try {
    await connectProducer();
    console.log("?? Kafka Producer Connected");
  } catch (err) {
    console.error("?? Kafka Producer Failed:", err.message);
  }

  app.listen(port, () => {
    console.log(`?? Product Service running on port ${port}`);
  });
};

startServer();
