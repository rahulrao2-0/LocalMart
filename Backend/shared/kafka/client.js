import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: process.env.SERVICE_NAME || "localmart-service",
  brokers: process.env.KAFKA_BROKER ? [process.env.KAFKA_BROKER] : ["localhost:9092"],
});

export const initTopics = async (topicsArray) => {
  const admin = kafka.admin();
  try {
    await admin.connect();
    const existingTopics = await admin.listTopics();
    const topicsToCreate = topicsArray
      .filter((topic) => !existingTopics.includes(topic))
      .map((topic) => ({
        topic,
        numPartitions: 1,
        replicationFactor: 1,
      }));

    if (topicsToCreate.length > 0) {
      await admin.createTopics({
        topics: topicsToCreate,
        waitForLeaders: true,
      });
      console.log(`✅ Created Kafka Topics: ${topicsToCreate.map((t) => t.topic).join(", ")}`);
    }
  } catch (error) {
    console.warn("⚠️ Could not auto-create Kafka topics:", error.message);
  } finally {
    await admin.disconnect();
  }
};
