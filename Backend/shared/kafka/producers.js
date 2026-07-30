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
    try{
        await producer.send({
            topic,
            messages: [
                {
                    value: JSON.stringify(event)
                }
            ]
        });
        console.log("✅ Event Published");
    }catch(err){
        console.error("❌ Failed to Publish Event", err);
    }
}