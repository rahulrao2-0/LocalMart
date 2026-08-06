import { createConsumer, TOPICS, publishEvent } from "@localmart/shared";
import Order from "../models/order.js";

const consumer = createConsumer("order-service-group");

export const connectPaymentConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: TOPICS.PAYMENT_EVENTS, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());

          if (event.type === "PAYMENT_SUCCESS") {
            const { orderId } = event.data;
            const order = await Order.findById(orderId);
            
            if (order) {
              order.paymentStatus = "COMPLETED";
              order.orderStatus = "CONFIRMED";
              order.timeline.push({ status: "CONFIRMED", message: "Payment successful, order confirmed", createdAt: new Date() });
              
              const updatedOrder = await order.save();
              console.log(`✅ Order ${orderId} confirmed after successful payment.`);

              // Publish Order Confirmed Event
              await publishEvent(TOPICS.ORDER_EVENTS, {
                type: "ORDER_CONFIRMED",
                data: updatedOrder,
              });
            }
          }

          if (event.type === "PAYMENT_FAILED") {
            const { orderId, reason } = event.data;
            const order = await Order.findById(orderId);
            
            if (order) {
              order.paymentStatus = "FAILED";
              order.orderStatus = "CANCELLED";
              order.timeline.push({ status: "CANCELLED", message: `Payment failed: ${reason}`, createdAt: new Date() });
              
              const updatedOrder = await order.save();
              console.log(`❌ Order ${orderId} cancelled due to payment failure.`);

              await publishEvent(TOPICS.ORDER_EVENTS, {
                type: "ORDER_CANCELLED",
                data: updatedOrder,
              });
            }
          }

        } catch (err) {
          console.error("Error processing payment event:", err);
        }
      },
    });

    console.log("🚀 Payment Consumer Connected");
  } catch (error) {
    console.error("❌ Payment Consumer Failed:", error.message);
  }
};
