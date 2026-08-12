import inventoryService from '../services/inventory.service.js';
import { createConsumer, TOPICS } from '@localmart/shared';

const startKafkaConsumer = async () => {
    try {
        const consumer = await createConsumer('inventory-service-group');
        const topics = [
            TOPICS?.ORDER_CREATED || 'ORDER_CREATED',
            TOPICS?.PAYMENT_FAILED || 'PAYMENT_FAILED',
            TOPICS?.ORDER_CANCELLED || 'ORDER_CANCELLED',
            TOPICS?.ORDER_DELIVERED || 'ORDER_DELIVERED'
        ];

        for (const topic of topics) {
            await consumer.subscribe({ topic, fromBeginning: false });
        }

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const event = JSON.parse(message.value.toString());
                    console.log(`\n======================================================`);
                    console.log(`📥 [INVENTORY SERVICE] Received KAFKA EVENT: ${topic}`);
                    console.log(`======================================================`);

                    switch (topic) {
                        case TOPICS?.ORDER_CREATED || 'ORDER_CREATED':
                            // Iterate over items and reserve stock
                            for (const item of event.items) {
                                console.log(`📦 [INVENTORY SERVICE] Reserving ${item.quantity} units of product ${item.productId}`);
                                await inventoryService.reserveStock(item.productId, item.quantity);
                            }
                            console.log(`✅ [INVENTORY SERVICE] Stock reservation complete for order.`);
                            break;
                        case TOPICS?.PAYMENT_FAILED || 'PAYMENT_FAILED':
                        case TOPICS?.ORDER_CANCELLED || 'ORDER_CANCELLED':
                            // Release reserved stock
                            for (const item of event.items) {
                                console.log(`🔄 [INVENTORY SERVICE] Releasing ${item.quantity} reserved units of product ${item.productId} due to cancellation/failure.`);
                                await inventoryService.releaseStock(item.productId, item.quantity);
                            }
                            console.log(`✅ [INVENTORY SERVICE] Stock release complete.`);
                            break;
                        case TOPICS?.ORDER_DELIVERED || 'ORDER_DELIVERED':
                            // Decrease current stock (it was reserved and is now delivered)
                            for (const item of event.items) {
                                console.log(`📉 [INVENTORY SERVICE] Deducting ${item.quantity} units of product ${item.productId} permanently from stock (delivered).`);
                                await inventoryService.decreaseStock(item.productId, item.quantity);
                                await inventoryService.releaseStock(item.productId, item.quantity);
                            }
                            console.log(`✅ [INVENTORY SERVICE] Final stock deduction complete.`);
                            break;
                        default:
                            console.log('Unhandled topic', topic);
                    }
                } catch (error) {
                    console.error(`Error processing message on topic ${topic}`, error);
                }
            },
        });
        console.log('Kafka Consumer started');
    } catch (error) {
        console.error('Failed to start Kafka Consumer', error);
    }
};

export { startKafkaConsumer };
