import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./config/db.js";
import { configureCloudinary } from "./config/cloudinary.js";
import userRoutes from "./routes/userRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import { startUserConsumer } from "./services/userConsumer.js";

const app = express();
const port = process.env.PORT || 3002;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/sellers", sellerRoutes);

const startServer = async () => {
  await connectDB();
  configureCloudinary();
  
  try {
    const { connectProducer } = await import("@localmart/shared");
    await connectProducer();
    console.log("🚀 Kafka Producer Connected for User Service");
  } catch (err) {
    console.error("❌ Kafka Producer Failed in User Service:", err.message);
  }

  await startUserConsumer();

  app.listen(port, () => {
    console.log(`?? User Service running on port ${port}`);
  });
};

startServer();
