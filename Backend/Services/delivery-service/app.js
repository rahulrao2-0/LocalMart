import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import deliveryRoutes from "./routes/delivery.routes.js";
import { startDeliveryConsumer } from "./kafka/deliveryConsumer.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/v1/delivery", deliveryRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error("❌ [DELIVERY SERVICE] Error:", err.stack);
  res.status(500).json({ success: false, message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 3008;

mongoose
  .connect(process.env.MONGO_URI || "mongodb+srv://yadavrahul81135_db_user:GLAv42eWHk960j3P@cluster0.achmfoa.mongodb.net/localmart_delivery?appName=Cluster0")
  .then(() => {
    console.log("✅ MongoDB connected for Delivery Service");
    app.listen(PORT, () => {
      console.log(`🚀 Delivery Service running on port ${PORT}`);
      startDeliveryConsumer();
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
