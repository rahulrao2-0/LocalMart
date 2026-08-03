import Product from "../models/Product.js";
import { cloudinary } from "../config/cloudinary.js";
import { publishEvent, TOPICS, redis } from "@localmart/shared";

// @desc    Get all products (with pagination, filtering, search)
// @route   GET /api/v1/products
// @access  Public (or Seller for their own)
export const getProducts = async (req, res) => {
  try {
    const { keyword, category, status, sellerId, page, limit } = req.query;

    // Set defaults: page 1, limit 2 for testing
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 2;

    // Create a dynamic cache key based on the query parameters
    const cacheKey = `products:page:${pageNum}:limit:${limitNum}:cat:${category || 'all'}:kw:${keyword || 'none'}`;

    // 1. Check Redis Cache
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log(`Serving from Redis Cache: ${cacheKey}`);
        return res.status(200).json(JSON.parse(cachedData));
      }
    } catch (err) {
      console.log("Redis get error:", err);
    }

    let query = {};
    if (keyword) query.name = { $regex: keyword, $options: "i" };
    if (category) query.category = category;
    if (status) query.status = status;
    if (sellerId) query.sellerId = sellerId;
    
    // Support fetching deleted products if requested explicitly by admin/seller, else filter them out
    if (!status && query.status !== "DELETED") {
       query.status = { $ne: "DELETED" };
    }

    const skip = (pageNum - 1) * limitNum;

    console.log(`Serving from MongoDB: ${cacheKey}`);
    const products = await Product.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 });
    const total = await Product.countDocuments(query);

    const responseData = {
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: products,
    };

    // 2. Save to Redis Cache (expire in 1 hour = 3600s)
    try {
      await redis.setEx(cacheKey, 3600, JSON.stringify(responseData));
    } catch (err) {
      console.log("Redis set error:", err);
    }

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private/Seller
export const createProduct = async (req, res) => {
  try {
    const { name, description, brand, category, price, stockAvailable } = req.body;
    
    // Images are handled by Multer Cloudinary storage
    const images = req.files ? req.files.map(file => ({
      url: file.path,
      public_id: file.filename
    })) : [];

    const product = await Product.create({
      name,
      description,
      brand,
      category,
      price: Number(price),
      stockAvailable: Number(stockAvailable),
      sellerId: req.user.userId, // From auth token
      images,
    });

    try {
      await publishEvent(TOPICS.PRODUCT_EVENTS, {
        eventType: "PRODUCT_CREATED",
        productId: product._id,
        sellerId: product.sellerId,
        name: product.name,
      });
    } catch(err) {
      console.error("Kafka publish error:", err);
    }

    return res.status(201).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Seller
export const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check ownership
    if (product.sellerId !== req.user.userId && !req.user.roles.includes("ADMIN")) {
      return res.status(403).json({ success: false, message: "Not authorized to update this product" });
    }

    const { name, description, brand, category, price, stockAvailable, status, deletedImages } = req.body;
    
    // Delete requested images from cloudinary
    if (deletedImages) {
      let publicIds = Array.isArray(deletedImages) ? deletedImages : JSON.parse(deletedImages);
      for (const public_id of publicIds) {
        await cloudinary.uploader.destroy(public_id);
        product.images = product.images.filter(img => img.public_id !== public_id);
      }
    }

    // Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: file.path,
        public_id: file.filename
      }));
      product.images = [...product.images, ...newImages];
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (brand) product.brand = brand;
    if (category) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (stockAvailable !== undefined) product.stockAvailable = Number(stockAvailable);
    if (status) product.status = status;

    await product.save();

    try {
      await publishEvent(TOPICS.PRODUCT_EVENTS, {
        eventType: "PRODUCT_UPDATED",
        productId: product._id,
      });
    } catch(err) {}

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/v1/products/:id
// @access  Private/Seller
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.sellerId !== req.user.userId && !req.user.roles.includes("ADMIN")) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this product" });
    }

    product.status = "DELETED";
    await product.save();
    
    try {
      await publishEvent(TOPICS.PRODUCT_EVENTS, {
        eventType: "PRODUCT_DELETED",
        productId: product._id,
      });
    } catch(err) {}

    return res.status(200).json({ success: true, data: {} });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
