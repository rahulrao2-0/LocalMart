import { kafka, TOPICS } from "@localmart/shared";
import { UserProfile } from "../models/UserProfile.js";

export const startUserConsumer = async () => {
  try {
    const consumer = kafka.consumer({ groupId: "user-service-group" });

    await consumer.connect();
    console.log("? User Service Kafka Consumer Connected");

    await consumer.subscribe({ topic: TOPICS.USER_EVENTS, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const payload = JSON.parse(message.value.toString());
          console.log(`?? Kafka Message Received on ${topic}:`, payload);

          if (payload.eventType === "USER_CREATED") {
            const { userId, email, fullName } = payload;

            const existingProfile = await UserProfile.findOne({ userId });
            if (!existingProfile) {
              await UserProfile.create({
                userId,
                email,
                fullName,
              });
              console.log(`? User Profile created in MongoDB for ${email}`);
            }
          }
        } catch (err) {
          console.error("? Error processing Kafka message:", err);
        }
      },
    });
  } catch (error) {
    console.error("? User Service Kafka Consumer Error:", error);
  }
};
