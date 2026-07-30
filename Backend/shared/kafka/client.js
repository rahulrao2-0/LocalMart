import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: process.env.SERVICE_NAME || "localmart-service",
  brokers: process.env.KAFKA_BROKER ? [process.env.KAFKA_BROKER] : ["localhost:9092"],
});