export const orderMapping = {
  mappings: {
    properties: {
      orderId: { type: "keyword" },
      orderNumber: { type: "keyword" },
      customerId: { type: "keyword" },
      sellerId: { type: "keyword" },
      deliveryPartnerId: { type: "keyword" },
      fulfillmentMode: { type: "keyword" },
      items: {
        type: "nested",
        properties: {
          productId: { type: "keyword" },
          productName: { type: "text" },
          quantity: { type: "integer" },
          price: { type: "float" },
          subtotal: { type: "float" }
        }
      },
      shippingAddress: {
        properties: {
          street: { type: "text" },
          city: { type: "keyword" },
          state: { type: "keyword" },
          postalCode: { type: "keyword" },
          location: { type: "geo_point" }
        }
      },
      subtotal: { type: "float" },
      deliveryCharge: { type: "float" },
      discount: { type: "float" },
      tax: { type: "float" },
      totalAmount: { type: "float" },
      paymentMethod: { type: "keyword" },
      paymentStatus: { type: "keyword" },
      orderStatus: { type: "keyword" },
      createdAt: { type: "date" },
      updatedAt: { type: "date" }
    }
  }
};
