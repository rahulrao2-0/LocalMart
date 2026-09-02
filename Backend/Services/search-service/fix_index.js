import client from './config/elasticsearch.js';
import { productMapping } from './mappings/productMapping.js';

const products = [
  {
    "_index":  "products",
    "_id":  "6a84927e6ccf2bdaff61af5e",
    "_source":  {
                    "productId":  "6a84927e6ccf2bdaff61af5e",
                    "name":  "Philips Essential Air Fryer",
                    "description":  "4.1 Liter capacity, Rapid Air Technology.",
                    "brand":  "Philips",
                    "category":  "Home & Kitchen",
                    "price":  8999,
                    "stockAvailable":  35,
                    "discount":  25,
                    "sellerId":  "seller-045",
                    "barcode":  "871010391234",
                    "barcodeType":  "EAN13",
                    "manufacturer":  "Philips",
                    "isTemplate":  false,
                    "status":  "ACTIVE",
                    "rating":  4.7,
                    "numReviews":  640,
                    "createdAt":  "2026-09-01T08:45:00Z",
                    "updatedAt":  "2026-09-01T08:45:00Z"
                }
  },
  {
    "_index":  "products",
    "_id":  "6a84927e6ccf2bdaff61af5d",
    "_source":  {
                    "productId":  "6a84927e6ccf2bdaff61af5d",
                    "name":  "The Pragmatic Programmer",
                    "description":  "Your journey to mastery, 20th Anniversary Edition.",
                    "brand":  "Addison-Wesley",
                    "category":  "Books",
                    "price":  2500,
                    "stockAvailable":  45,
                    "discount":  10,
                    "sellerId":  "seller-001",
                    "barcode":  "9780135957059",
                    "barcodeType":  "ISBN",
                    "manufacturer":  "Pearson",
                    "isTemplate":  false,
                    "status":  "ACTIVE",
                    "rating":  4.9,
                    "numReviews":  2100,
                    "createdAt":  "2026-08-25T11:20:00Z",
                    "updatedAt":  "2026-08-25T11:20:00Z"
                }
  },
  {
    "_index":  "products",
    "_id":  "6a84927e6ccf2bdaff61af5c",
    "_source":  {
                    "productId":  "6a84927e6ccf2bdaff61af5c",
                    "name":  "Nike Dri-FIT Men's Running T-Shirt",
                    "description":  "Breathable, sweat-wicking fabric for maximum comfort during workouts.",
                    "brand":  "Nike",
                    "category":  "Apparel",
                    "price":  1499,
                    "stockAvailable":  120,
                    "discount":  15,
                    "sellerId":  "seller-022",
                    "barcode":  "888407123456",
                    "barcodeType":  "EAN13",
                    "manufacturer":  "Nike",
                    "isTemplate":  false,
                    "status":  "ACTIVE",
                    "rating":  4.5,
                    "numReviews":  320,
                    "createdAt":  "2026-08-20T14:30:00Z",
                    "updatedAt":  "2026-08-21T09:15:00Z"
                }
  },
  {
    "_index":  "products",
    "_id":  "6a84927e6ccf2bdaff61af5b",
    "_source":  {
                    "productId":  "6a84927e6ccf2bdaff61af5b",
                    "name":  "Apple iPhone 15 Pro",
                    "description":  "6.1-inch Super Retina XDR display, Titanium design, A17 Pro chip.",
                    "brand":  "Apple",
                    "category":  "Tech & Electronics",
                    "price":  134900,
                    "stockAvailable":  55,
                    "discount":  5,
                    "sellerId":  "seller-010",
                    "barcode":  "194253123456",
                    "barcodeType":  "UPC",
                    "manufacturer":  "Apple Inc.",
                    "isTemplate":  false,
                    "status":  "ACTIVE",
                    "rating":  4.9,
                    "numReviews":  850,
                    "createdAt":  "2026-08-15T10:00:00Z",
                    "updatedAt":  "2026-08-15T10:00:00Z"
                }
  }
];

const run = async () => {
  try {
    const exists = await client.indices.exists({ index: 'products' });
    if (exists) {
      console.log('Deleting existing products index...');
      await client.indices.delete({ index: 'products' });
    }
    console.log('Creating products index with correct mapping...');
    await client.indices.create({
      index: 'products',
      body: productMapping
    });

    console.log('Inserting products...');
    for (const doc of products) {
      await client.index({
        index: 'products',
        id: doc._id,
        body: doc._source
      });
    }
    
    // Refresh the index to make docs immediately searchable
    await client.indices.refresh({ index: 'products' });
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
};

run();
