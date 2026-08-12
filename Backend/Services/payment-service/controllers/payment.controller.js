import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/payment.js";
import { publishEvent, TOPICS } from "@localmart/shared";
import dotenv from "dotenv";

dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order (Synchronous call from Order Service)
export const createOrder = async (req, res, next) => {
  try {
    const { orderId, customerId, sellerId, amount, currency } = req.body;

    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: currency || "INR",
      receipt: `receipt_${orderId}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    const payment = new Payment({
      orderId,
      customerId,
      sellerId,
      amount,
      currency: currency || "INR",
      razorpayOrderId: razorpayOrder.id,
      status: "PENDING",
    });

    await payment.save();

    res.status(200).json({
      success: true,
      orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Payment create order error:", error);
    next(error);
  }
};

// Verify Payment (From frontend after Razorpay Checkout)
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    const paymentRecord = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

    if (!paymentRecord) {
      return res.status(404).json({ success: false, message: "Payment record not found" });
    }

    if (isAuthentic) {
      paymentRecord.razorpayPaymentId = razorpay_payment_id;
      paymentRecord.status = "SUCCESS";
      await paymentRecord.save();

      // Publish Kafka Event
      console.log(`📡 [PAYMENT SERVICE] Publishing PAYMENT_SUCCESS for order ${paymentRecord.orderId} to ${TOPICS.PAYMENT_EVENTS}`);
      await publishEvent(TOPICS.PAYMENT_EVENTS, {
        type: "PAYMENT_SUCCESS",
        data: {
          orderId: paymentRecord.orderId,
          customerId: paymentRecord.customerId,
          paymentId: paymentRecord._id,
          razorpayOrderId: razorpay_order_id,
          amount: paymentRecord.amount,
          status: "SUCCESS",
        },
      });
      console.log(`✅ [PAYMENT SERVICE] PAYMENT_SUCCESS event published successfully.`);

      res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      paymentRecord.status = "FAILED";
      paymentRecord.failureReason = "Signature mismatch";
      await paymentRecord.save();

      // Publish Kafka Event
      console.log(`📡 [PAYMENT SERVICE] Publishing PAYMENT_FAILED for order ${paymentRecord.orderId} to ${TOPICS.PAYMENT_EVENTS}`);
      await publishEvent(TOPICS.PAYMENT_EVENTS, {
        type: "PAYMENT_FAILED",
        data: {
          orderId: paymentRecord.orderId,
          customerId: paymentRecord.customerId,
          reason: "Signature mismatch",
          status: "FAILED",
        },
      });
      console.log(`✅ [PAYMENT SERVICE] PAYMENT_FAILED event published successfully.`);

      res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    next(error);
  }
};

// Webhook (Server-to-Server safety net)
export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.body.toString();

    // Webhooks use a DIFFERENT secret than the standard API
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).send("Invalid Signature");
    }

    const webhookData = JSON.parse(rawBody);
    
    if (webhookData.event === "payment.captured") {
      const paymentData = webhookData.payload.payment.entity;
      
      const paymentRecord = await Payment.findOne({ razorpayOrderId: paymentData.order_id, status: "PENDING" });
      
      if (paymentRecord) {
        paymentRecord.razorpayPaymentId = paymentData.id;
        paymentRecord.status = "SUCCESS";
        await paymentRecord.save();

        // Publish Kafka Event
        console.log(`📡 [PAYMENT SERVICE Webhook] Publishing PAYMENT_SUCCESS for order ${paymentRecord.orderId} to ${TOPICS.PAYMENT_EVENTS}`);
        await publishEvent(TOPICS.PAYMENT_EVENTS, {
          type: "PAYMENT_SUCCESS",
          data: {
            orderId: paymentRecord.orderId,
            customerId: paymentRecord.customerId,
            paymentId: paymentRecord._id,
            razorpayOrderId: paymentData.order_id,
            amount: paymentRecord.amount,
            status: "SUCCESS",
          },
        });
        console.log(`✅ [PAYMENT SERVICE Webhook] PAYMENT_SUCCESS event published successfully.`);
      }
    }

    // Always acknowledge Razorpay immediately
    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send("Webhook processing error");
  }
};
