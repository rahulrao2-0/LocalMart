import express from "express";
import { signup, login, refresh, logout, verifyEmail, me } from "../controllers/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.get("/me", me);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;