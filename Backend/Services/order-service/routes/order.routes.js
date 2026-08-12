import express from "express";
import {
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  cancelOrder,
  getSellerOrders,
  requestDelivery,
  acceptDelivery
} from "../controllers/order.controller.js";

import { checkIdempotency } from "../middleware/idempotency.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, checkIdempotency, createOrder);
router.get("/user/:userId", authMiddleware, getMyOrders);
router.get("/seller", authMiddleware, getSellerOrders);
router.get("/seller/:sellerId", authMiddleware, getSellerOrders);
router.get("/:id", authMiddleware, getOrderById);

router.put("/:id/status", authMiddleware, updateOrderStatus);
router.put("/:id/cancel", authMiddleware, cancelOrder);
router.put("/:id/request-delivery", authMiddleware, requestDelivery);
router.put("/:id/accept-delivery", authMiddleware, acceptDelivery);

export default router;
