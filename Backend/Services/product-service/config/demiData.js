const products = [
  // ==========================
  // VEGETABLES
  // ==========================

  {
    name: "Fresh Tomato",
    description: "Farm fresh red tomatoes rich in vitamins and perfect for daily cooking.",
    brand: "Fresh Farms",
    category: "Vegetables",
    price: 40,
    stockAvailable: 150,
    images: [
      {
        url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80",
        public_id: "products/tomato",
      },
    ],
    sellerId: "seller-001",
    status: "ACTIVE",
    rating: 4.5,
    numReviews: 78,
  },

  {
    name: "Organic Potato",
    description: "Premium quality organic potatoes sourced directly from local farmers.",
    brand: "Organic Harvest",
    category: "Vegetables",
    price: 35,
    stockAvailable: 200,
    images: [
      {
        url: "https://images.unsplash.com/photo-1518977676601-b144525f1901?w=800&q=80",
        public_id: "products/potato",
      },
    ],
    sellerId: "seller-001",
    status: "ACTIVE",
    rating: 4.3,
    numReviews: 55,
  },

  {
    name: "Fresh Carrot",
    description: "Crunchy and naturally sweet carrots packed with nutrients.",
    brand: "Green Basket",
    category: "Vegetables",
    price: 60,
    stockAvailable: 120,
    images: [
      {
        url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80",
        public_id: "products/carrot",
      },
    ],
    sellerId: "seller-002",
    status: "ACTIVE",
    rating: 4.7,
    numReviews: 91,
  },

  // ==========================
  // FURNITURE
  // ==========================

  {
    name: "Wooden Dining Table",
    description: "6-seater premium solid wood dining table with modern finish.",
    brand: "HomeCraft",
    category: "Furniture",
    price: 18999,
    stockAvailable: 15,
    images: [
      {
        url: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&q=80",
        public_id: "products/dining-table",
      },
    ],
    sellerId: "seller-003",
    status: "ACTIVE",
    rating: 4.8,
    numReviews: 43,
  },

  {
    name: "Office Chair",
    description: "Ergonomic office chair with adjustable height and lumbar support.",
    brand: "Urban Living",
    category: "Furniture",
    price: 6499,
    stockAvailable: 35,
    images: [
      {
        url: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80",
        public_id: "products/office-chair",
      },
    ],
    sellerId: "seller-003",
    status: "ACTIVE",
    rating: 4.6,
    numReviews: 89,
  },

  {
    name: "Queen Size Bed",
    description: "Modern wooden queen size bed with durable engineered wood frame.",
    brand: "SleepWell",
    category: "Furniture",
    price: 24999,
    stockAvailable: 8,
    images: [
      {
        url: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80",
        public_id: "products/queen-bed",
      },
    ],
    sellerId: "seller-004",
    status: "ACTIVE",
    rating: 4.9,
    numReviews: 26,
  },

  // ==========================
  // TECH & ELECTRONICS
  // ==========================

  {
    name: "Apple iPhone 16",
    description: "Latest Apple smartphone with A18 chip and 128GB storage.",
    brand: "Apple",
    category: "Tech & Electronics",
    price: 79999,
    stockAvailable: 20,
    images: [
      {
        url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
        public_id: "products/iphone16",
      },
    ],
    sellerId: "seller-005",
    status: "ACTIVE",
    rating: 4.9,
    numReviews: 245,
  },

  {
    name: "Samsung Smart TV 55\"",
    description: "55-inch 4K Ultra HD Smart LED TV with HDR support.",
    brand: "Samsung",
    category: "Tech & Electronics",
    price: 52999,
    stockAvailable: 12,
    images: [
      {
        url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80",
        public_id: "products/samsung-tv",
      },
    ],
    sellerId: "seller-005",
    status: "ACTIVE",
    rating: 4.7,
    numReviews: 132,
  },

  {
    name: "Dell Inspiron 15 Laptop",
    description: "Intel Core i5, 16GB RAM, 512GB SSD with Full HD display.",
    brand: "Dell",
    category: "Tech & Electronics",
    price: 64999,
    stockAvailable: 18,
    images: [
      {
        url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80",
        public_id: "products/dell-inspiron",
      },
    ],
    sellerId: "seller-006",
    status: "ACTIVE",
    rating: 4.8,
    numReviews: 104,
  },
];

export default products;