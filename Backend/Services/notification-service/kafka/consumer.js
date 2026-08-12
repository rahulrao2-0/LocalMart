import { kafka, TOPICS } from '@localmart/shared';
import notificationService from '../services/notification.service.js';

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
          const event = JSON.parse(rawMessage);
          console.log(`\n======================================================`);
          console.log(`📥 [NOTIFICATION SERVICE] Received KAFKA EVENT: ${event.type || event.eventType}`);
          console.log(`======================================================`);

          // 1. Process Order Events
          if (topic === TOPICS.ORDER_EVENTS) {
            const order = event.data;
            if (!order) {
              console.warn("⚠️ [KAFKA] Event data is empty. Skipping.");
              return;
            }

            const { _id: orderId, orderNumber, customerId, sellerId, totalAmount } = order;
            const customerEmail = order.shippingAddress?.email || order.email || order.customerEmail;

            if (event.type === "ORDER_CREATED") {
              console.log(`📦 [ORDER_CREATED] Order ${orderNumber} created. Notifying customer and seller.`);
              
              // Notify Customer (DB + Email via Brevo)
              await notificationService.createNotification({
                userId: customerId,
                role: "CUSTOMER",
                title: "Order Placed",
                message: `Your order #${orderNumber} of ₹${totalAmount} has been placed successfully.`,
                type: "ORDER_CREATED",
                metadata: { orderId, orderNumber },
                userEmail: customerEmail
              });

              // Notify Seller (DB + Live Socket)
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
              
              // Notify Customer (DB + Confirmation Email via Brevo)
              await notificationService.createNotification({
                userId: customerId,
                role: "CUSTOMER",
                title: "Order Confirmed!",
                message: `Great news! Your order #${orderNumber} of ₹${totalAmount} has been confirmed.`,
                type: "ORDER_CONFIRMED",
                metadata: { orderId, orderNumber },
                userEmail: customerEmail
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
              
              await notificationService.createNotification({
                userId: customerId,
                role: "CUSTOMER",
                title: "Order Cancelled",
                message: `Your order #${orderNumber} has been cancelled.`,
                type: "ORDER_CANCELLED",
                metadata: { orderId, orderNumber },
                userEmail: customerEmail
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

            else if (event.type === "ORDER_STATUS_UPDATED") {
              const newStatus = order.orderStatus || order.status;
              console.log(`🔄 [ORDER_STATUS_UPDATED] Order ${orderNumber} status changed to ${newStatus}.`);

              await notificationService.createNotification({
                userId: customerId,
                role: "CUSTOMER",
                title: `Order Status: ${newStatus}`,
                message: `Your order #${orderNumber} is now ${newStatus}.`,
                type: "ORDER_STATUS_UPDATED",
                metadata: { orderId, orderNumber, newStatus },
                userEmail: customerEmail
              });

              await notificationService.createNotification({
                userId: sellerId,
                role: "SELLER",
                title: "Order Status Updated",
                message: `Order #${orderNumber} status was updated to ${newStatus}.`,
                type: "ORDER_STATUS_UPDATED",
                metadata: { orderId, orderNumber, newStatus }
              });
            }

            else if (event.type === "DELIVERY_ASSIGNED") {
              console.log(`🚚 [DELIVERY_ASSIGNED] Order ${orderNumber} assigned to partner ${order.deliveryPartnerId}.`);

              if (order.deliveryPartnerId) {
                await notificationService.createNotification({
                  userId: order.deliveryPartnerId,
                  role: "DELIVERY",
                  title: "Delivery Assigned",
                  message: `You have been assigned order #${orderNumber}.`,
                  type: "DELIVERY_ASSIGNED",
                  metadata: { orderId, orderNumber }
                });
              }
              
              await notificationService.createNotification({
                userId: customerId,
                role: "CUSTOMER",
                title: "Delivery Partner Assigned",
                message: `A delivery partner has been assigned to your order #${orderNumber}.`,
                type: "DELIVERY_ASSIGNED",
                metadata: { orderId, orderNumber },
                userEmail: customerEmail
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
              
              const customerEmail = payment.email || payment.customerEmail;
              
              await notificationService.createNotification({
                userId: customerId,
                role: "CUSTOMER",
                title: "Payment Failed",
                message: `Your payment of ₹${amount} failed. Reason: ${reason || 'Unknown'}`,
                type: "PAYMENT_FAILED",
                metadata: { orderId },
                userEmail: customerEmail
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
