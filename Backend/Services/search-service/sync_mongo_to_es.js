import client from './config/elasticsearch.js';

const syncProducts = async () => {
  try {
    console.log('Fetching products from product-service...');
    const response = await fetch('http://localhost:3000/api/v1/products?limit=100');
    const data = await response.json();

    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
      console.log('No products found in MongoDB.');
      return;
    }

    const productsList = data.data;

    console.log(`Found ${productsList.length} products. Syncing to Elasticsearch...`);
    
    // Clear old products first
    await client.deleteByQuery({
      index: 'products',
      body: {
        query: { match_all: {} }
      }
    });

    for (const product of productsList) {
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
    }

    await client.indices.refresh({ index: 'products' });
    console.log('Sync complete! Search index is now up to date with MongoDB.');
  } catch (error) {
    console.error('Error syncing products:', error);
  } finally {
    process.exit(0);
  }
};

syncProducts();
