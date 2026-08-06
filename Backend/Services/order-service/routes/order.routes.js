import express from "express";
import {
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  cancelOrder,
  getSellerOrders,
  assignDelivery
} from "../controllers/order.controller.js";

import { checkIdempotency } from "../middleware/idempotency.js";

const router = express.Router();

router.post("/", checkIdempotency, createOrder);
router.get("/user/:userId", getMyOrders);
router.get("/seller/:sellerId", getSellerOrders);
router.get("/:id", getOrderById);

router.put("/:id/status", updateOrderStatus);
router.put("/:id/cancel", cancelOrder);
router.put("/:id/assign-delivery", assignDelivery);

export default router;
