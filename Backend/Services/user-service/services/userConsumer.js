import { kafka, TOPICS, initTopics } from "@localmart/shared";
import { UserProfile } from "../models/UserProfile.js";
import { Seller } from "../models/Seller.js";
import { DeliveryPartner } from "../models/DeliveryPartner.js";

export const startUserConsumer = async () => {
  try {
    await initTopics([TOPICS.USER_EVENTS]);

    const consumer = kafka.consumer({ groupId: "user-service-group" });

    await consumer.connect();
    console.log("✅ User Service Kafka Consumer Connected");

    await consumer.subscribe({ topics: [TOPICS.USER_EVENTS], fromBeginning: true });


    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(`📥 [KAFKA CONSUMER] Message received on topic "${topic}" [Partition: ${partition}, Offset: ${message.offset}]`);
        try {
          const rawContent = message.value.toString();
          console.log(`📄 [KAFKA CONSUMER] Raw Message Value:`, rawContent);

          const payload = JSON.parse(rawContent);
          console.log(`🔍 [KAFKA CONSUMER] Parsed Event Type: "${payload.eventType}"`);

          if (payload.eventType === "USER_CREATED") {
            const { userId, email, fullName } = payload;
            console.log(`⚙️ [KAFKA CONSUMER] Processing USER_CREATED for User ID: ${userId}, Email: ${email}`);

            let profile = await UserProfile.findOne({ $or: [{ userId }, { email }] });
            if (!profile) {
              profile = await UserProfile.create({
                userId,
                email,
                fullName,
              });
              console.log(`✅ [USER SERVICE] Created new MongoDB UserProfile document:`, profile._id);
            } else {
              profile.userId = userId;
              if (email) profile.email = email;
              if (fullName) profile.fullName = fullName;
              await profile.save();
              console.log(`ℹ️ [USER SERVICE] Updated existing UserProfile in MongoDB for User ID: ${userId}`);
            }
          } else if (payload.eventType === "SELLER_CREATED") {
            const { userId, email, businessName, ownerName, phone, businessType, gstNumber, panNumber } = payload;
            console.log(`⚙️ [KAFKA CONSUMER] Processing SELLER_CREATED for User ID: ${userId}, Business: ${businessName}`);

            let seller = await Seller.findOne({ $or: [{ authUserId: userId }, { email }] });
            if (!seller) {
              seller = await Seller.create({
                authUserId: userId,
                email: email,
                businessName: businessName || 'Unknown Business',
                ownerName: ownerName || 'Unknown Owner',
                phone: phone || '0000000000',
                businessType: businessType || "RETAIL",
                gstNumber: gstNumber || "",
                panNumber: panNumber || "",
              });
              console.log(`✅ [USER SERVICE] Created new MongoDB Seller document:`, seller._id);
            } else {
              seller.authUserId = userId;
              if (email) seller.email = email;
              if (businessName) seller.businessName = businessName;
              if (ownerName) seller.ownerName = ownerName;
              if (phone) seller.phone = phone;
              await seller.save();
              console.log(`ℹ️ [USER SERVICE] Updated existing Seller profile in MongoDB for User ID: ${userId}`);
            }
          } else if (payload.eventType === "DELIVERY_CREATED") {
            const { userId, email, fullName, phone, vehicleType, vehicleNumber } = payload;
            console.log(`⚙️ [KAFKA CONSUMER] Processing DELIVERY_CREATED for User ID: ${userId}, Name: ${fullName}`);

            let partner = await DeliveryPartner.findOne({ authUserId: userId });
            if (!partner) {
              partner = await DeliveryPartner.create({
                authUserId: userId,
                fullName: fullName || 'Unknown Partner',
                phone: phone || '0000000000',
                vehicleType: vehicleType || "BIKE",
                vehicleNumber: vehicleNumber || "",
              });
              console.log(`✅ [USER SERVICE] Created new MongoDB DeliveryPartner document:`, partner._id);
            } else {
              partner.authUserId = userId;
              if (fullName) partner.fullName = fullName;
              if (phone) partner.phone = phone;
              await partner.save();
              console.log(`ℹ️ [USER SERVICE] Updated existing DeliveryPartner profile in MongoDB for User ID: ${userId}`);
            }
          } else {
            console.log(`⚠️ [KAFKA CONSUMER] Unhandled eventType: "${payload.eventType}"`);
          }
        } catch (err) {
          console.error("❌ [KAFKA CONSUMER] Error processing message:", err);
        }
      },
    });
  } catch (error) {
    console.error("❌ [KAFKA CONSUMER] Fatal Error in Consumer Loop:", error);
  }

};
