import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRouter.js";
import {connectDB} from "./config/db.js";

const app = express();
const port = 3001;



app.use(express.json())
app.use(cookieParser())

app.use("/api/v1/auth",authRouter)

const startServer = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`🚀 Auth Service running on port ${port}`);
  });
};

startServer();