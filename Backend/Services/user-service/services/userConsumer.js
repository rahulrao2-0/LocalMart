import { kafka, TOPICS, initTopics } from "@localmart/shared";
import { UserProfile } from "../models/UserProfile.js";

export const startUserConsumer = async () => {
  try {
    await initTopics([TOPICS.USER_EVENTS]);

    const consumer = kafka.consumer({ groupId: "user-service-group" });

    await consumer.connect();
    console.log("✅ User Service Kafka Consumer Connected");

    await consumer.subscribe({ topic: TOPICS.USER_EVENTS, fromBeginning: true });


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

            const existingProfile = await UserProfile.findOne({ userId });
            if (!existingProfile) {
              const newProfile = await UserProfile.create({
                userId,
                email,
                fullName,
              });
              console.log(`✅ [USER SERVICE] Created new MongoDB UserProfile document:`, newProfile._id);
            } else {
              console.log(`ℹ️ [USER SERVICE] User Profile already exists in MongoDB for User ID: ${userId}`);
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
