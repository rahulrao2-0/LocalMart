import { kafka } from "./client.js";

export const createConsumer = (groupId) => {
    return kafka.consumer({ groupId });
};