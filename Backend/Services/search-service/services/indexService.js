import client from '../config/elasticsearch.js';
import { productMapping } from '../mappings/productMapping.js';
import { orderMapping } from '../mappings/orderMapping.js';
import { sellerMapping } from '../mappings/sellerMapping.js';

const createIndexIfNotExists = async (indexName, mapping) => {
  try {
    const indexExists = await client.indices.exists({ index: indexName });
    if (!indexExists) {
      await client.indices.create({
        index: indexName,
        body: mapping
      });
      console.log(`Index "${indexName}" created successfully.`);
    } else {
      console.log(`Index "${indexName}" already exists.`);
    }
  } catch (error) {
    console.error(`Error creating index "${indexName}":`, error);
  }
};

export const initializeIndices = async () => {
  console.log('Initializing Elasticsearch indices...');
  await createIndexIfNotExists('products', productMapping);
  await createIndexIfNotExists('orders', orderMapping);
  await createIndexIfNotExists('sellers', sellerMapping);
  console.log('Indices initialization complete.');
};
