import express from "express";
import { registerSeller, getSellerProfile, getAllSellers } from "../controllers/sellerController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get All Sellers (public)
router.get("/all", getAllSellers);

// Register or Update Seller Profile
router.post("/profile", authMiddleware, registerSeller);

// Get Seller Profile
router.get("/profile", authMiddleware, getSellerProfile);

export default router;
