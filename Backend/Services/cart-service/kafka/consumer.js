import { createConsumer, TOPICS } from '@localmart/shared';
import cartRepository from '../repositories/cartRepository.js';

const runConsumer = async () => {
    const consumer = await createConsumer('cart-service-group');
    
    await consumer.subscribe({ topics: [TOPICS.PRODUCT_EVENTS], fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const data = JSON.parse(message.value.toString());
            console.log(`Received message from ${topic} with eventType: ${data.eventType}`, data);
            
            if (data.eventType === 'PRODUCT_DELETED') {
                await cartRepository.removeProductFromAllCarts(data.productId);
            } else if (data.eventType === 'PRODUCT_UPDATED') {
                await cartRepository.updateProductsInAllCarts(data.productId, data);
            }
        },
    });
};

export {  runConsumer  };
