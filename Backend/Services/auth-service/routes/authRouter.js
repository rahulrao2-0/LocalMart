import express from "express";
import { signup, login, refresh, logout, verifyEmail, me, resendOtp } from "../controllers/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);
router.get("/me", me);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;