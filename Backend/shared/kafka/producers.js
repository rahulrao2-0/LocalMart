import { kafka } from "./client.js";

const producer = kafka.producer();

export const connectProducer = async () => {
    try{
        await producer.connect();
        console.log("✅ Kafka Producer Connected");
    }catch(err){
        console.error("❌ Kafka Producer Connection Failed", err);
    }
}

export const publishEvent = async (topic, event) => {
    console.log(`📤 [KAFKA PRODUCER] Attempting to publish event to topic "${topic}"...`);
    console.log(`📦 [KAFKA PRODUCER] Event Payload:`, JSON.stringify(event, null, 2));
    try {
        const result = await producer.send({
            topic,
            messages: [
                {
                    value: JSON.stringify(event)
                }
            ]
        });
        console.log(`✅ [KAFKA PRODUCER] Event successfully published to topic "${topic}". Result:`, result);
    } catch (err) {
        console.error(`❌ [KAFKA PRODUCER] Failed to publish event to topic "${topic}". Error:`, err);
    }
}
