import express from "express";
import { registerSeller, getSellerProfile } from "../controllers/sellerController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Register or Update Seller Profile
router.post("/profile", authMiddleware, registerSeller);

// Get Seller Profile
router.get("/profile", authMiddleware, getSellerProfile);

export default router;
