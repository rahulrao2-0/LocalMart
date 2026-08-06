import { kafka, TOPICS } from '@localmart/shared';
import notificationService from '../services/notification.service.js';

// Helper to fetch user email internally from user-service
const fetchUserProfile = async (userId) => {
  console.log(`[NOTIFICATION SERVICE] Fetching profile internally for user ID: ${userId}`);
  try {
    const res = await fetch(`http://localhost:3002/api/v1/users/internal/${userId}`);
    if (!res.ok) {
      console.error(`[NOTIFICATION SERVICE] Failed to fetch profile for user ${userId}. Status: ${res.status}`);
      return null;
    }
    const data = await res.json();
    console.log(`[NOTIFICATION SERVICE] Profile fetched successfully for ${userId}:`, data.profile?.email);
    return data.profile;
  } catch (err) {
    console.error(`[NOTIFICATION SERVICE] Error fetching user profile for ${userId}:`, err.message);
    return null;
  }
};

export const startConsumer = async () => {
  try {
    const consumer = kafka.consumer({ groupId: 'notification-group' });
    await consumer.connect();
    console.log('✅ Kafka Consumer connected for notification-service');

    // Subscribe to the main transactional event topics
    await consumer.subscribe({ topic: TOPICS.ORDER_EVENTS, fromBeginning: false });
    await consumer.subscribe({ topic: TOPICS.PAYMENT_EVENTS, fromBeginning: false });
    console.log(`📡 Subscribed to topics: ${TOPICS.ORDER_EVENTS}, ${TOPICS.PAYMENT_EVENTS}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const rawMessage = message.value.toString();
          console.log(`📥 [KAFKA] Received message on topic [${topic}]:`, rawMessage);

          const event = JSON.parse(rawMessage);
          console.log(`🔍 [KAFKA] Parsed Event Type: ${event.type || event.eventType}`);

          // 1. Process Order Events
          if (topic === TOPICS.ORDER_EVENTS) {
            const order = event.data;
            if (!order) {
              console.warn("⚠️ [KAFKA] Event data is empty. Skipping.");
              return;
            }

            const { _id: orderId, orderNumber, customerId, sellerId, totalAmount } = order;

            if (event.type === "ORDER_CREATED") {
              console.log(`📦 [ORDER_CREATED] Order ${orderNumber} created. Notifying customer and seller.`);
              
              // Get Customer email to send notification
              const customerProfile = await fetchUserProfile(customerId);
              
              // Notify Customer (DB + Email)
              await notificationService.createNotification({
                userId: customerId,
                role: "CUSTOMER",
                title: "Order Placed",
                message: `Your order #${orderNumber} of ₹${totalAmount} has been placed successfully.`,
                type: "ORDER_CREATED",
                metadata: { orderId, orderNumber },
                userEmail: customerProfile?.email
              });

              // Notify Seller (DB only / Live Socket)
              await notificationService.createNotification({
                userId: sellerId,
                role: "SELLER",
                title: "New Order",
                message: `You have received a new order #${orderNumber} of ₹${totalAmount}.`,
                type: "ORDER_CREATED",
                metadata: { orderId, orderNumber }
              });
            }

            else if (event.type === "ORDER_CONFIRMED") {
              console.log(`✅ [ORDER_CONFIRMED] Order ${orderNumber} confirmed. Sending confirmation email.`);
              
              const customerProfile = await fetchUserProfile(customerId);
              
              // Notify Customer (DB + Email)
              await notificationService.createNotification({
                userId: customerId,
                role: "CUSTOMER",
                title: "Order Confirmed!",
                message: `Great news! Your order #${orderNumber} has been confirmed.`,
                type: "ORDER_CONFIRMED",
                metadata: { orderId, orderNumber },
                userEmail: customerProfile?.email
              });

              // Notify Seller
              await notificationService.createNotification({
                userId: sellerId,
                role: "SELLER",
                title: "Order Confirmed",
                message: `Order #${orderNumber} has been confirmed by successful payment.`,
                type: "ORDER_CONFIRMED",
                metadata: { orderId, orderNumber }
              });
            }

            else if (event.type === "ORDER_CANCELLED") {
              console.log(`❌ [ORDER_CANCELLED] Order ${orderNumber} cancelled.`);
              
              const customerProfile = await fetchUserProfile(customerId);
              
              await notificationService.createNotification({
                userId: customerId,
                role: "CUSTOMER",
                title: "Order Cancelled",
                message: `Your order #${orderNumber} has been cancelled.`,
                type: "ORDER_CANCELLED",
                metadata: { orderId, orderNumber },
                userEmail: customerProfile?.email
              });

              await notificationService.createNotification({
                userId: sellerId,
                role: "SELLER",
                title: "Order Cancelled",
                message: `Order #${orderNumber} was cancelled.`,
                type: "ORDER_CANCELLED",
                metadata: { orderId, orderNumber }
              });
            }
          }

          // 2. Process Payment Events
          else if (topic === TOPICS.PAYMENT_EVENTS) {
            const payment = event.data;
            if (!payment) return;

            const { orderId, customerId, amount, status, reason } = payment;

            if (event.type === "PAYMENT_FAILED") {
              console.log(`❌ [PAYMENT_FAILED] Payment failed for order ${orderId}. Reason: ${reason}`);
              
              const customerProfile = await fetchUserProfile(customerId);
              
              await notificationService.createNotification({
                userId: customerId,
                role: "CUSTOMER",
                title: "Payment Failed",
                message: `Your payment of ₹${amount} failed. Reason: ${reason || 'Unknown'}`,
                type: "PAYMENT_FAILED",
                metadata: { orderId },
                userEmail: customerProfile?.email
              });
            }
          }

        } catch (err) {
          console.error(`❌ Error processing Kafka message on topic [${topic}]:`, err.message);
        }
      },
    });
  } catch (error) {
    console.error('❌ Failed to start Kafka Consumer for notification-service:', error);
  }
};
