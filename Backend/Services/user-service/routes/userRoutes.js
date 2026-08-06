import express from "express";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  uploadProfileImage,
  addAddress,
  updateAddress,
  deleteAddress,
  getProfileInternal,
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/internal/:userId", getProfileInternal);

// Profile Routes
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.delete("/profile", authMiddleware, deleteProfile);
router.post("/profile/avatar", authMiddleware, upload.single("image"), uploadProfileImage);

// Address Routes
router.post("/address", authMiddleware, addAddress);
router.put("/address/:addressId", authMiddleware, updateAddress);
router.delete("/address/:addressId", authMiddleware, deleteAddress);

export default router;
