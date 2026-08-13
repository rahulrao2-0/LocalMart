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

    // Publish Delivery Assigned Event to Order Service
    await publishEvent(TOPICS.ORDER_EVENTS, {
      type: "DELIVERY_ASSIGNED",
      data: {
        _id: orderId,
        orderNumber: delivery.orderNumber,
        customerId: delivery.customerId,
        sellerId: delivery.sellerId,
        deliveryPartnerId: deliveryPartnerId,
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
        customerId: delivery.customerId,
        sellerId: delivery.sellerId,
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

export const getPartnerDashboard = async (req, res, next) => {
  try {
    const partnerId = req.user?.id || req.params.partnerId;
    const deliveries = await Delivery.find({ deliveryPartnerId: partnerId });
    
    const completed = deliveries.filter(d => d.status === 'DELIVERED');
    const pending = deliveries.filter(d => d.status !== 'DELIVERED' && d.status !== 'CANCELLED' && d.status !== 'SEARCHING_FOR_PARTNER');
    
    const todaysEarnings = completed.length * 50;
    const weeklyEarnings = todaysEarnings * 3;
    const monthlyEarnings = todaysEarnings * 12;
    
    const stats = {
      todaysDeliveries: completed.length + pending.length,
      pendingDeliveries: pending.length,
      completedDeliveries: completed.length,
      todaysEarnings,
      weeklyEarnings,
      monthlyEarnings,
      averageRating: 4.8,
      totalRatings: completed.length,
      acceptanceRate: 98,
      onTimeRate: 95,
      hoursOnline: 6.5,
      distanceKm: completed.length * 4.5,
      currentStatus: 'Active',
      todayTarget: 1500,
    };
    
    res.status(200).json({ success: true, data: { stats, recentDeliveries: [], chartData: [] } });
  } catch (error) {
    next(error);
  }
};

export const checkDeliveryAvailability = async (req, res, next) => {
  try {
    const userRes = await fetch('http://localhost:3002/api/v1/users/delivery-partners/online-count');
    const userData = await userRes.json();
    const count = userData?.count || 0;
    
    const isAvailable = count > 0;
    
    if (isAvailable) {
        return res.status(200).json({ success: true, available: true, message: 'Delivery partners are available' });
    } else {
        return res.status(200).json({ success: true, available: false, message: 'High demand! No delivery partners available right now.' });
    }
  } catch (error) {
    next(error);
  }
};
