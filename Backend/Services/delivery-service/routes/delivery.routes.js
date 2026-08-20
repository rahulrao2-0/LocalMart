import express from "express";
import {
  assignDeliveryPartner,
  getPartnerDeliveries,
  updateDeliveryStatus,
  cancelDelivery,
  getPartnerDashboard,
  checkDeliveryAvailability,
  updatePartnerStatus
} from "../controllers/delivery.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/availability", authMiddleware, checkDeliveryAvailability);
router.put("/status", authMiddleware, updatePartnerStatus);
router.put("/partner/status", authMiddleware, updatePartnerStatus);

router.get("/partner/:partnerId/dashboard", authMiddleware, getPartnerDashboard);
router.get("/partner/:partnerId/orders", authMiddleware, getPartnerDeliveries);
router.post("/:orderId/accept", authMiddleware, assignDeliveryPartner);
router.put("/:orderId/status", authMiddleware, updateDeliveryStatus);
router.put("/:orderId/cancel", authMiddleware, cancelDelivery);

export default router;

