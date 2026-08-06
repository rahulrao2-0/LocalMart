import { createConsumer, TOPICS } from '@localmart/shared';
import cartRepository from '../repositories/cartRepository.js';

const runConsumer = async () => {
    const consumer = await createConsumer('cart-service-group');
    
    await consumer.subscribe({ topic: TOPICS.PRODUCT_DELETED, fromBeginning: true });
    await consumer.subscribe({ topic: TOPICS.PRODUCT_UPDATED, fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const data = JSON.parse(message.value.toString());
            console.log(`Received message from ${topic}`, data);
            
            if (topic === TOPICS.PRODUCT_DELETED) {
                await cartRepository.removeProductFromAllCarts(data.productId);
            } else if (topic === TOPICS.PRODUCT_UPDATED) {
                await cartRepository.updateProductsInAllCarts(data.productId, data);
            }
        },
    });
};

export {  runConsumer  };
