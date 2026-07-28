import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRouter.js";
import { connectDB, pool } from "./config/db.js";
import { verifyAccessToken } from "./utils/jwt.js";

const app = express();
const port = 3001;



app.use(express.json())
app.use(cookieParser())

app.use("/api/v1/auth",authRouter)

app.get("/me", async (req, res) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. No access token provided.",
      });
    }

    const decoded = verifyAccessToken(token);

    // Fetch fresh user data from database
    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.is_email_verified, 
              COALESCE(JSON_ARRAYAGG(r.name), JSON_ARRAY('CUSTOMER')) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = rows[0];
    if (typeof user.roles === "string") {
      try {
        user.roles = JSON.parse(user.roles);
      } catch (e) {
        user.roles = ["CUSTOMER"];
      }
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token.",
    });
  }
});

const startServer = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`🚀 Auth Service running on port ${port}`);
  });
};

startServer();