import { createConsumer, TOPICS } from '@localmart/shared';
import client from '../config/elasticsearch.js';

export const startProductConsumer = async () => {
  const consumer = createConsumer('search-service-group');
  
  try {
    await consumer.connect();
    console.log('Search Service: Kafka Consumer connected');
    
    await consumer.subscribe({ topic: TOPICS.PRODUCT_EVENTS, fromBeginning: false });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          console.log(`[Search Service] Received Kafka Event: ${event.eventType} for product ${event.productId}`);
          
          if (event.eventType === 'PRODUCT_CREATED' || event.eventType === 'PRODUCT_UPDATED') {
            // Fetch latest product details from product-service
            const res = await fetch(`http://localhost:3000/api/v1/products/${event.productId}`);
            const json = await res.json();
            
            if (json.success && json.data) {
              const product = json.data;
              
              const esDoc = {
                productId: product._id,
                name: product.name,
                description: product.description,
                brand: product.brand,
                category: product.category,
                price: product.price,
                discount: product.discount || 0,
                effectivePrice: product.price - (product.price * (product.discount || 0) / 100),
                stockAvailable: product.stockAvailable,
                status: product.status,
                sellerId: product.sellerId,
                barcode: product.barcode,
                barcodeType: product.barcodeType,
                manufacturer: product.manufacturer,
                weight: product.weight,
                images: product.images,
                rating: product.rating || 0,
                numReviews: product.numReviews || 0,
                isTemplate: product.isTemplate || false,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
              };

              await client.index({
                index: 'products',
                id: product._id,
                body: esDoc
              });
              
              console.log(`[Search Service] Indexed product ${product._id} to Elasticsearch`);
            } else {
               console.warn(`[Search Service] Failed to fetch product ${event.productId} details. Response:`, json);
            }
          } else if (event.eventType === 'PRODUCT_DELETED') {
            await client.delete({
              index: 'products',
              id: event.productId
            });
            console.log(`[Search Service] Deleted product ${event.productId} from Elasticsearch`);
          }
          
        } catch (err) {
          console.error(`[Search Service] Error processing message:`, err);
        }
      }
    });
  } catch (error) {
    console.error('Search Service: Kafka Consumer error:', error);
  }
};
