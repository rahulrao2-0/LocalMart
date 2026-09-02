export const productMapping = {
  mappings: {
    properties: {
      productId: { type: "keyword" },
      name: { 
        type: "text", 
        analyzer: "standard", 
        fields: {
          keyword: { type: "keyword" },
          autocomplete: { type: "text", analyzer: "edge_ngram_analyzer" }
        }
      },
      description: { type: "text", analyzer: "standard" },
      brand: { type: "text", fields: { keyword: { type: "keyword" } } },
      category: { type: "keyword" },
      price: { type: "float" },
      discount: { type: "float" },
      effectivePrice: { type: "float" },
      stockAvailable: { type: "integer" },
      status: { type: "keyword" },
      sellerId: { type: "keyword" },
      barcode: { type: "keyword" },
      barcodeType: { type: "keyword" },
      manufacturer: { type: "text", fields: { keyword: { type: "keyword" } } },
      weight: { type: "keyword" },
      images: { type: "object", properties: { url: { type: "keyword", index: false } } },
      rating: { type: "float" },
      numReviews: { type: "integer" },
      isTemplate: { type: "boolean" },
      createdAt: { type: "date" },
      updatedAt: { type: "date" }
    }
  },
  settings: {
    analysis: {
      analyzer: {
        edge_ngram_analyzer: {
          type: "custom",
          tokenizer: "edge_ngram_tokenizer",
          filter: ["lowercase"]
        }
      },
      tokenizer: {
        edge_ngram_tokenizer: {
          type: "edge_ngram",
          min_gram: 2,
          max_gram: 15,
          token_chars: ["letter", "digit"]
        }
      }
    }
  }
};
