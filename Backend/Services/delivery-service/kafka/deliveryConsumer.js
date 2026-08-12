import { kafka, TOPICS } from "@localmart/shared";
import Delivery from "../models/Delivery.js";

export const startDeliveryConsumer = async () => {
  try {
    const consumer = kafka.consumer({ groupId: "delivery-service-group" });
    await consumer.connect();
    console.log("✅ Kafka Consumer connected for Delivery Service");

    await consumer.subscribe({ topic: TOPICS.ORDER_EVENTS, fromBeginning: false });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const rawMessage = message.value.toString();
          const event = JSON.parse(rawMessage);
          
          console.log(`\n======================================================`);
          console.log(`📥 [DELIVERY SERVICE] Received KAFKA EVENT: ${event.type}`);
          console.log(`======================================================`);
          
          if (topic === TOPICS.ORDER_EVENTS) {
            const order = event.data;
            
            // 1. Create a delivery when order needs a partner
            if (event.type === "ORDER_STATUS_UPDATED" && (order.orderStatus === "SEARCHING_FOR_PARTNER" || order.status === "SEARCHING_FOR_PARTNER")) {
              console.log(`📦 [DELIVERY SERVICE] Order ${order.orderNumber} is searching for partner. Creating delivery record.`);
              
              const existing = await Delivery.findOne({ orderId: order._id });
              if (!existing) {
                await Delivery.create({
                  orderId: order._id,
                  orderNumber: order.orderNumber,
                  customerId: order.customerId,
                  sellerId: order.sellerId,
                  status: "SEARCHING_FOR_PARTNER",
                  pickupLocation: {
                    address: order.sellerAddress || "Seller Location",
                  },
                  dropLocation: {
                    address: order.shippingAddress?.street || "Customer Location",
                  },
                  timeline: [{ status: "SEARCHING_FOR_PARTNER", message: "Delivery request created" }]
                });
                console.log(`✅ [DELIVERY SERVICE] Created Delivery record for Order ${order._id}`);
              }
            }

            // 2. Assign partner if updated via some other means
            if (event.type === "DELIVERY_ASSIGNED") {
               const existing = await Delivery.findOne({ orderId: order._id });
               if (existing && !existing.deliveryPartnerId) {
                  existing.deliveryPartnerId = order.deliveryPartnerId;
                  existing.status = "PARTNER_ASSIGNED";
                  existing.timeline.push({ status: "PARTNER_ASSIGNED", message: "Partner assigned from Order Service event." });
                  await existing.save();
                  console.log(`✅ [DELIVERY SERVICE] Assigned partner ${order.deliveryPartnerId} to Delivery ${order._id}`);
               }
            }
          }
        } catch (error) {
          console.error("❌ [KAFKA] Delivery Consumer Error:", error.message);
        }
      }
    });
  } catch (error) {
    console.error("❌ Failed to start Delivery Kafka Consumer:", error);
  }
};
