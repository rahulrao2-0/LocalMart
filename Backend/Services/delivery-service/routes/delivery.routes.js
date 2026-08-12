import express from "express";
import {
  assignDeliveryPartner,
  getPartnerDeliveries,
  updateDeliveryStatus,
  cancelDelivery
} from "../controllers/delivery.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/partner/:partnerId/orders", authMiddleware, getPartnerDeliveries);
router.post("/:orderId/accept", authMiddleware, assignDeliveryPartner);
router.put("/:orderId/status", authMiddleware, updateDeliveryStatus);
router.put("/:orderId/cancel", authMiddleware, cancelDelivery);

export default router;
