export const sellerMapping = {
  mappings: {
    properties: {
      sellerId: { type: "keyword" },
      authUserId: { type: "keyword" },
      businessName: { 
        type: "text", 
        fields: {
          keyword: { type: "keyword" },
          autocomplete: { type: "text", analyzer: "edge_ngram_analyzer" }
        }
      },
      ownerName: { type: "text" },
      email: { type: "keyword" },
      phone: { type: "keyword" },
      businessType: { type: "keyword" },
      verificationStatus: { type: "keyword" },
      accountStatus: { type: "keyword" },
      rating: { type: "float" },
      totalReviews: { type: "integer" },
      addresses: {
        type: "nested",
        properties: {
          addressType: { type: "keyword" },
          city: { type: "keyword" },
          state: { type: "keyword" },
          postalCode: { type: "keyword" },
          location: { type: "geo_point" },
          isDefault: { type: "boolean" }
        }
      }
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
