import Order from "../models/order.js";
import { publishEvent, TOPICS } from "@localmart/shared";
import { v4 as uuidv4 } from "uuid";

// Helper for adding timeline events
const addTimelineEvent = (order, status, message) => {
  order.timeline.push({ status, message, createdAt: new Date() });
};

// Create a new order
export const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      subtotal,
      deliveryCharge,
      discount,
      tax,
      totalAmount,
      paymentMethod,
      sellerId,
    } = req.body;
    const customerId = req.user?.id || req.body.customerId;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No order items provided" });
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = new Order({
      orderNumber,
      customerId,
      sellerId,
      items,
      shippingAddress,
      subtotal,
      deliveryCharge: deliveryCharge || 0,
      discount: discount || 0,
      tax: tax || 0,
      totalAmount,
      paymentMethod,
      paymentStatus: "PENDING", // Wait for payment success event
      orderStatus: "PENDING",
      timeline: [
        { status: "PENDING", message: "Order placed successfully", createdAt: new Date() },
      ],
    });

    const createdOrder = await order.save();

    let paymentData = null;

    if (paymentMethod === "RAZORPAY") {
      // Synchronous REST call to Payment Service
      try {
        const paymentRes = await fetch("http://localhost:3005/api/v1/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: createdOrder._id.toString(),
            customerId,
            sellerId,
            amount: totalAmount,
            currency: "INR"
          }),
        });

        const paymentResData = await paymentRes.json();
        
        if (paymentResData.success) {
          createdOrder.razorpayOrderId = paymentResData.razorpayOrderId;
          await createdOrder.save();
          paymentData = paymentResData;
        } else {
          return res.status(500).json({ success: false, message: "Payment initialization failed", data: createdOrder });
        }
      } catch (err) {
        console.error("Error communicating with Payment Service:", err.message);
        if (req.idempotencyKey) {
          const { redis } = await import("@localmart/shared");
          await redis.del(req.idempotencyKey);
        }
        return res.status(500).json({ success: false, message: "Payment service unavailable", data: createdOrder });
      }
    }

    // Publish Order Created Event
    await publishEvent(TOPICS.ORDER_EVENTS, {
      type: "ORDER_CREATED",
      data: createdOrder,
    });

    res.status(201).json({ success: true, data: createdOrder, payment: paymentData });
  } catch (error) {
    if (req.idempotencyKey) {
      const { redis } = await import("@localmart/shared");
      await redis.del(req.idempotencyKey);
    }
    next(error);
  }
};

// Get order by ID
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// Get logged in user's orders
export const getMyOrders = async (req, res, next) => {
  try {
    const customerId = req.user?.id || req.params.userId;
    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// Update order status (General)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, message } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.orderStatus = orderStatus;
    addTimelineEvent(order, orderStatus, message || `Order status updated to ${orderStatus}`);
    
    const updatedOrder = await order.save();

    await publishEvent(TOPICS.ORDER_EVENTS, {
      type: "ORDER_STATUS_UPDATED",
      data: updatedOrder,
    });

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// Cancel order
export const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.orderStatus === "DELIVERED" || order.orderStatus === "CANCELLED") {
      return res.status(400).json({ success: false, message: "Order cannot be cancelled" });
    }

    order.orderStatus = "CANCELLED";
    addTimelineEvent(order, "CANCELLED", reason || "Order cancelled by user");

    const updatedOrder = await order.save();

    await publishEvent(TOPICS.ORDER_EVENTS, {
      type: "ORDER_CANCELLED",
      data: updatedOrder,
    });

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// Seller Order Management - Get Seller Orders
export const getSellerOrders = async (req, res, next) => {
  try {
    const sellerId = req.user?.id || req.params.sellerId;
    const orders = await Order.find({ sellerId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// Delivery Assignment
export const assignDelivery = async (req, res, next) => {
  try {
    const { deliveryPartnerId, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.deliveryPartnerId = deliveryPartnerId;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    
    order.orderStatus = "OUT_FOR_DELIVERY";
    addTimelineEvent(order, "OUT_FOR_DELIVERY", "Order has been assigned to a delivery partner");

    const updatedOrder = await order.save();

    await publishEvent(TOPICS.ORDER_EVENTS, {
      type: "DELIVERY_ASSIGNED",
      data: updatedOrder,
    });

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};
