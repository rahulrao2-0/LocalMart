import { kafka } from '@localmart/shared';
import notificationService from '../services/notification.service.js';

export const startConsumer = async () => {
    try {
        const consumer = kafka.consumer({ groupId: 'notification-group' });
        await consumer.connect();
        console.log('Kafka Consumer connected for notification-service');

        const topics = ['PAYMENT_FAILED', 'REVIEW_RECEIVED', 'DELIVERY_ASSIGNED', 'DELIVERY_COMPLETED'];
        
        for (const topic of topics) {
            await consumer.subscribe({ topic, fromBeginning: false });
        }

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const payload = JSON.parse(message.value.toString());
                    console.log(`Received Kafka Event [${topic}]:`, payload);
                    
                    if (!payload.userId || !payload.title || !payload.message) {
                        console.error('Invalid Kafka payload structure', payload);
                        return;
                    }

                    await notificationService.createNotification({
                        userId: payload.userId,
                        role: payload.role,
                        title: payload.title,
                        message: payload.message,
                        type: topic,
                        metadata: payload.metadata,
                        userEmail: payload.userEmail
                    });

                    console.log(`Successfully processed event [${topic}]`);
                } catch (err) {
                    console.error(`Error processing Kafka message for topic [${topic}]:`, err.message);
                }
            },
        });
    } catch (error) {
        console.error('Failed to start Kafka Consumer:', error);
    }
};
