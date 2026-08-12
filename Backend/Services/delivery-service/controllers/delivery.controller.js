import Delivery from "../models/Delivery.js";
import { publishEvent, TOPICS } from "@localmart/shared";

// Helper for adding timeline events
const addTimelineEvent = (delivery, status, message) => {
  delivery.timeline.push({ status, message, createdAt: new Date() });
};

// 1. Delivery Partner accepts a delivery job
export const assignDeliveryPartner = async (req, res, next) => {
  try {
    const deliveryPartnerId = req.user?.id || req.body.deliveryPartnerId;
    const { orderId } = req.params;

    const delivery = await Delivery.findOne({ orderId });
    if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

    if (delivery.status !== "SEARCHING_FOR_PARTNER") {
      return res.status(400).json({ success: false, message: "Delivery is no longer available." });
    }

    delivery.deliveryPartnerId = deliveryPartnerId;
    delivery.status = "PARTNER_ASSIGNED";
    addTimelineEvent(delivery, "PARTNER_ASSIGNED", "Partner accepted the delivery.");

    const updatedDelivery = await delivery.save();

    // Publish event back to kafka so order-service and notification-service can react
    await publishEvent(TOPICS.ORDER_EVENTS, {
      type: "DELIVERY_ASSIGNED",
      data: {
        _id: orderId,
        orderNumber: delivery.orderNumber,
        deliveryPartnerId,
        status: "PARTNER_ASSIGNED"
      }
    });

    res.status(200).json({ success: true, data: updatedDelivery });
  } catch (error) {
    next(error);
  }
};

// 2. Get Deliveries for a Partner
export const getPartnerDeliveries = async (req, res, next) => {
  try {
    const deliveryPartnerId = req.user?.id || req.params.partnerId;
    const deliveries = await Delivery.find({
      $or: [
        { deliveryPartnerId },
        { status: "SEARCHING_FOR_PARTNER" }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: deliveries });
  } catch (error) {
    next(error);
  }
};

// 3. Update Delivery Status (Pickup, Transit, Delivered)
export const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { status, message } = req.body;
    const { orderId } = req.params;

    const delivery = await Delivery.findOne({ orderId });
    if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

    delivery.status = status;
    addTimelineEvent(delivery, status, message || `Status updated to ${status}`);

    const updatedDelivery = await delivery.save();

    // Publish event so order-service updates the Order document
    await publishEvent(TOPICS.ORDER_EVENTS, {
      type: "ORDER_STATUS_UPDATED",
      data: {
        _id: orderId,
        orderNumber: delivery.orderNumber,
        orderStatus: status,
        deliveryPartnerId: delivery.deliveryPartnerId
      }
    });

    res.status(200).json({ success: true, data: updatedDelivery });
  } catch (error) {
    next(error);
  }
};

// 4. Cancel Delivery
export const cancelDelivery = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const { orderId } = req.params;

    const delivery = await Delivery.findOne({ orderId });
    if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

    delivery.status = "CANCELLED";
    delivery.cancellationReason = reason;
    addTimelineEvent(delivery, "CANCELLED", reason || "Cancelled by partner");

    const updatedDelivery = await delivery.save();

    // Publish event
    await publishEvent(TOPICS.ORDER_EVENTS, {
      type: "ORDER_STATUS_UPDATED",
      data: {
        _id: orderId,
        orderNumber: delivery.orderNumber,
        orderStatus: "SEARCHING_FOR_PARTNER" // Reset order status so another partner can pick it up
      }
    });

    res.status(200).json({ success: true, data: updatedDelivery });
  } catch (error) {
    next(error);
  }
};
