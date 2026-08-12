import Order from "../models/order.js";
import { publishEvent, TOPICS } from "@localmart/shared";
import { v4 as uuidv4 } from "uuid";

// Helper for adding timeline events
const addTimelineEvent = (order, status, message) => {
  order.timeline.push({ status, message, createdAt: new Date() });
};

// Create a new order
export const createOrder = async (req, res, next) => {
  console.log("📥 [ORDER SERVICE] createOrder API Hit!");
  try {
    const {
      items,
      shippingAddress,
      fulfillmentMode = "DELIVERY",
      subtotal,
      deliveryCharge,
      discount,
      tax,
      totalAmount,
      paymentMethod,
      sellerId,
    } = req.body;
    const customerId = req.user?.id || req.body.customerId;

    console.log("🔍 [ORDER SERVICE] Incoming request body:", JSON.stringify(req.body, null, 2));
    console.log("🔍 [ORDER SERVICE] Resolved Customer ID:", customerId);

    if (!items || items.length === 0) {
      console.warn("⚠️ [ORDER SERVICE] No items provided in order request.");
      return res.status(400).json({ success: false, message: "No order items provided" });
    }

    if (fulfillmentMode === "DELIVERY" && !shippingAddress) {
      console.warn("⚠️ [ORDER SERVICE] Shipping address required for DELIVERY.");
      return res.status(400).json({ success: false, message: "Shipping address is required for delivery" });
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    console.log(`📦 [ORDER SERVICE] Generating order number: ${orderNumber}`);

    const order = new Order({
      orderNumber,
      customerId,
      sellerId,
      fulfillmentMode,
      items,
      shippingAddress,
      subtotal,
      deliveryCharge: fulfillmentMode === "PICKUP" ? 0 : (deliveryCharge || 0),
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
    console.log(`✅ [ORDER SERVICE] Order successfully saved in MongoDB with ID: ${createdOrder._id}`);

    let paymentData = null;

    if (paymentMethod === "RAZORPAY") {
      // Synchronous REST call to Payment Service
      console.log(`💳 [ORDER SERVICE] Initiating Razorpay order creation for orderId: ${createdOrder._id}`);
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
        console.log("💳 [ORDER SERVICE] Razorpay API Response:", JSON.stringify(paymentResData, null, 2));
        
        if (paymentResData.success) {
          createdOrder.razorpayOrderId = paymentResData.razorpayOrderId;
          await createdOrder.save();
          console.log(`✅ [ORDER SERVICE] Linked Razorpay Order ID ${paymentResData.razorpayOrderId} to order.`);
          paymentData = paymentResData;
        } else {
          console.error("❌ [ORDER SERVICE] Payment initialization failed inside Payment Service.");
          return res.status(500).json({ success: false, message: "Payment initialization failed", data: createdOrder });
        }
      } catch (err) {
        console.error("❌ [ORDER SERVICE] Error communicating with Payment Service:", err.message);
        if (req.idempotencyKey) {
          const { redis } = await import("@localmart/shared");
          await redis.del(req.idempotencyKey);
        }
        return res.status(500).json({ success: false, message: "Payment service unavailable", data: createdOrder });
      }
    }

    // Publish Order Created Event
    console.log(`📡 [ORDER SERVICE] Publishing ORDER_CREATED event to Kafka topic ${TOPICS.ORDER_EVENTS}`);
    await publishEvent(TOPICS.ORDER_EVENTS, {
      type: "ORDER_CREATED",
      data: createdOrder,
    });
    console.log("✅ [ORDER SERVICE] ORDER_CREATED Kafka event published.");

    res.status(201).json({ success: true, data: createdOrder, payment: paymentData });
  } catch (error) {
    console.error("❌ [ORDER SERVICE] Fatal error during createOrder:", error);
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
  console.log("📥 [ORDER SERVICE] getSellerOrders API Hit!");
  try {
    const sellerId = req.user?.id || req.params.sellerId;
    console.log("🔍 [ORDER SERVICE] Resolved Seller ID:", sellerId);
    
    if (!sellerId) {
      console.warn("⚠️ [ORDER SERVICE] Missing sellerId. Cannot fetch seller orders.");
      return res.status(400).json({ success: false, message: "Seller ID is required" });
    }

    const orders = await Order.find({ sellerId }).sort({ createdAt: -1 });
    console.log(`✅ [ORDER SERVICE] Fetched ${orders.length} orders for seller ${sellerId}`);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("❌ [ORDER SERVICE] Error fetching seller orders:", error);
    next(error);
  }
};

// Delivery Assignment Flow - Step 1: Seller Requests a Partner
export const requestDelivery = async (req, res, next) => {
  try {
    const { deliveryPartnerId } = req.body; // The ID of the partner the seller pinged
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.orderStatus !== "READY_FOR_PICKUP") {
      return res.status(400).json({ success: false, message: "Order must be READY_FOR_PICKUP before requesting delivery." });
    }

    order.orderStatus = "SEARCHING_FOR_PARTNER";
    addTimelineEvent(order, "SEARCHING_FOR_PARTNER", "Seller has requested a delivery partner");

    const updatedOrder = await order.save();

    // In a real app, you would use Redis to ping this specific partner via Socket.io
    // io.to(deliveryPartnerId).emit("NEW_DELIVERY_REQUEST", { order: updatedOrder });

    await publishEvent(TOPICS.ORDER_EVENTS, {
      type: "ORDER_STATUS_UPDATED",
      data: updatedOrder,
    });

    res.status(200).json({ success: true, message: "Delivery request sent to partner", data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// Delivery Assignment Flow - Step 2: Partner Accepts the Request
export const acceptDelivery = async (req, res, next) => {
  try {
    // In reality, this comes from req.user.id (the logged-in delivery partner)
    const deliveryPartnerId = req.user?.id || req.body.deliveryPartnerId; 
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.orderStatus !== "SEARCHING_FOR_PARTNER") {
      return res.status(400).json({ success: false, message: "This order is not looking for a partner anymore." });
    }

    order.deliveryPartnerId = deliveryPartnerId;
    order.orderStatus = "PARTNER_ASSIGNED";
    addTimelineEvent(order, "PARTNER_ASSIGNED", "Delivery partner has accepted the order");

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
