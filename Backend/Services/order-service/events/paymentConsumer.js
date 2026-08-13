import { createConsumer, TOPICS, publishEvent } from "@localmart/shared";
import Order from "../models/order.js";

const consumer = createConsumer("order-service-group");

export const connectPaymentConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topics: [TOPICS.PAYMENT_EVENTS, TOPICS.ORDER_EVENTS], fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());

          console.log(`\n📥 [ORDER SERVICE] Received KAFKA EVENT: ${event.type}`);
          
          if (event.type === "PAYMENT_SUCCESS") {
            const { orderId } = event.data;
            const order = await Order.findById(orderId);
            
            if (order) {
              order.paymentStatus = "COMPLETED";
              
              if (order.fulfillmentMode === "DELIVERY") {
                order.orderStatus = "SEARCHING_FOR_PARTNER";
                order.timeline.push({ status: "CONFIRMED", message: "Payment successful, order confirmed", createdAt: new Date() });
                order.timeline.push({ status: "SEARCHING_FOR_PARTNER", message: "Looking for delivery partner", createdAt: new Date() });
              } else {
                order.orderStatus = "CONFIRMED";
                order.timeline.push({ status: "CONFIRMED", message: "Payment successful, order confirmed", createdAt: new Date() });
              }
              
              const updatedOrder = await order.save();
              console.log(`✅ [ORDER SERVICE] Order ${orderId} updated to CONFIRMED after successful payment.`);

              // Publish Order Confirmed Event
              console.log(`📡 [ORDER SERVICE] Publishing ORDER_CONFIRMED to ${TOPICS.ORDER_EVENTS}`);
              await publishEvent(TOPICS.ORDER_EVENTS, {
                type: "ORDER_CONFIRMED",
                data: updatedOrder,
              });
              console.log(`✅ [ORDER SERVICE] ORDER_CONFIRMED published successfully.`);
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
              console.log(`❌ [ORDER SERVICE] Order ${orderId} cancelled due to payment failure.`);

              console.log(`📡 [ORDER SERVICE] Publishing ORDER_CANCELLED to ${TOPICS.ORDER_EVENTS}`);
              await publishEvent(TOPICS.ORDER_EVENTS, {
                type: "ORDER_CANCELLED",
                data: updatedOrder,
              });
              console.log(`✅ [ORDER SERVICE] ORDER_CANCELLED published successfully.`);
            }
          if (event.type === "DELIVERY_ASSIGNED") {
            const { _id, deliveryPartnerId } = event.data;
            const order = await Order.findById(_id);
            if (order) {
              order.deliveryPartnerId = deliveryPartnerId;
              order.orderStatus = "PARTNER_ASSIGNED";
              order.timeline.push({ status: "PARTNER_ASSIGNED", message: "Delivery partner assigned", createdAt: new Date() });
              await order.save();
              console.log(`✅ [ORDER SERVICE] Order ${_id} updated to PARTNER_ASSIGNED`);
            }
          }

          if (event.type === "ORDER_STATUS_UPDATED") {
            const { _id, orderStatus, deliveryPartnerId } = event.data;
            const order = await Order.findById(_id);
            if (order && orderStatus) {
              order.orderStatus = orderStatus;
              if (deliveryPartnerId) order.deliveryPartnerId = deliveryPartnerId;
              order.timeline.push({ status: orderStatus, message: `Status updated to ${orderStatus}`, createdAt: new Date() });
              await order.save();
              console.log(`✅ [ORDER SERVICE] Order ${_id} updated to ${orderStatus}`);
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
