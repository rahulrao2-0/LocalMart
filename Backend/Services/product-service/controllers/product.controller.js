import Product from "../models/Product.js";
import { cloudinary } from "../config/cloudinary.js";
import { publishEvent, TOPICS, redis } from "@localmart/shared";

// @desc    Get all products (with pagination, filtering, search)
// @route   GET /api/v1/products
// @access  Public (or Seller for their own)
export const getProducts = async (req, res) => {
  try {
    const { keyword, category, status, sellerId, page, limit } = req.query;

    // Set defaults: page 1, limit 2
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 2;

    // Create a dynamic cache key based on the query parameters
    const cacheKey = `products:page:${pageNum}:limit:${limitNum}:cat:${category || 'all'}:kw:${keyword || 'none'}:seller:${sellerId || 'all'}`;

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

// Helper to extract weight/quantity from API payload or title regex
const parseWeight = (dataObj, title = "") => {
  if (dataObj.quantity && typeof dataObj.quantity === "string" && dataObj.quantity.trim()) {
    return dataObj.quantity.trim();
  }
  if (dataObj.size && typeof dataObj.size === "string" && dataObj.size.trim()) {
    return dataObj.size.trim();
  }
  if (dataObj.product_quantity && dataObj.product_quantity_unit) {
    return `${dataObj.product_quantity} ${dataObj.product_quantity_unit}`;
  }
  if (dataObj.net_weight_value && dataObj.net_weight_unit) {
    return `${dataObj.net_weight_value} ${dataObj.net_weight_unit}`;
  }
  if (dataObj.serving_size && typeof dataObj.serving_size === "string" && dataObj.serving_size.trim()) {
    return dataObj.serving_size.trim();
  }

  // Extract pattern like 500g, 1.5kg, 750ml, 2L, 12 oz from Title
  if (title) {
    const match = title.match(/(\d+(?:\.\d+)?\s*(?:kg|g|gm|gms|ml|l|ltr|liter|liters|oz|lb|lbs|fl\.?\s*oz))\b/i);
    if (match) {
      return match[1].trim();
    }
  }

  return "";
};

// External Barcode APIs Fallback Waterfall
const fetchFromExternalBarcodeApis = async (barcode) => {
  // 1. Open Food Facts (Groceries, Food, Snacks, Beverages)
  try {
    console.log(`🔍 [API 1] Querying OpenFoodFacts for barcode: ${barcode}...`);
    const res1 = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, { signal: AbortSignal.timeout(3000) });
    const data1 = await res1.json();
    if (data1 && data1.status === 1 && data1.product && (data1.product.product_name || data1.product.product_name_en)) {
      const p = data1.product;
      const titleName = p.product_name || p.product_name_en;
      const extractedWeight = parseWeight(p, titleName);
      console.log(`✅ [API 1 MATCH] OpenFoodFacts found product: ${titleName} (Weight: ${extractedWeight || 'N/A'})`);
      return {
        name: titleName,
        brand: p.brands || "Generic",
        category: p.categories ? p.categories.split(",")[0].trim() : "Groceries",
        description: p.generic_name || p.ingredients_text || "No description available",
        manufacturer: p.manufacturing_places || "Unknown",
        weight: extractedWeight,
        images: p.image_url ? [{ url: p.image_url, public_id: "external_off" }] : []
      };
    }
  } catch (err) {
    console.log("⚠️ [API 1] OpenFoodFacts failed or timed out:", err.message);
  }

  // 2. UPC Item DB Trial API (General Retail, Electronics, Household, Books)
  try {
    console.log(`🔍 [API 2] Querying UPCItemDB for barcode: ${barcode}...`);
    const res2 = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`, { signal: AbortSignal.timeout(3000) });
    const data2 = await res2.json();
    if (data2 && data2.code === "OK" && data2.items && data2.items.length > 0 && data2.items[0].title) {
      const item = data2.items[0];
      const extractedWeight = parseWeight(item, item.title);
      console.log(`✅ [API 2 MATCH] UPCItemDB found product: ${item.title} (Weight: ${extractedWeight || 'N/A'})`);
      return {
        name: item.title,
        brand: item.brand || "Generic",
        category: item.category ? item.category.split(">").pop().trim() : "General",
        description: item.description || "No description available",
        manufacturer: item.publisher || item.brand || "Unknown",
        weight: extractedWeight,
        images: item.images && item.images.length > 0 ? [{ url: item.images[0], public_id: "external_upc" }] : []
      };
    }
  } catch (err) {
    console.log("⚠️ [API 2] UPCItemDB failed or timed out:", err.message);
  }

  // 3. Open Products Facts (General Goods, Hardware, Home Items)
  try {
    console.log(`🔍 [API 3] Querying OpenProductsFacts for barcode: ${barcode}...`);
    const res3 = await fetch(`https://world.openproductsfacts.org/api/v0/product/${barcode}.json`, { signal: AbortSignal.timeout(3000) });
    const data3 = await res3.json();
    if (data3 && data3.status === 1 && data3.product && (data3.product.product_name || data3.product.product_name_en)) {
      const p = data3.product;
      const titleName = p.product_name || p.product_name_en;
      const extractedWeight = parseWeight(p, titleName);
      console.log(`✅ [API 3 MATCH] OpenProductsFacts found product: ${titleName} (Weight: ${extractedWeight || 'N/A'})`);
      return {
        name: titleName,
        brand: p.brands || "Generic",
        category: p.categories ? p.categories.split(",")[0].trim() : "General",
        description: p.generic_name || "No description available",
        manufacturer: p.manufacturing_places || "Unknown",
        weight: extractedWeight,
        images: p.image_url ? [{ url: p.image_url, public_id: "external_opf" }] : []
      };
    }
  } catch (err) {
    console.log("⚠️ [API 3] OpenProductsFacts failed or timed out:", err.message);
  }

  // 4. Open Beauty Facts (Cosmetics, Personal Care, Toiletries)
  try {
    console.log(`🔍 [API 4] Querying OpenBeautyFacts for barcode: ${barcode}...`);
    const res4 = await fetch(`https://world.openbeautyfacts.org/api/v0/product/${barcode}.json`, { signal: AbortSignal.timeout(3000) });
    const data4 = await res4.json();
    if (data4 && data4.status === 1 && data4.product && (data4.product.product_name || data4.product.product_name_en)) {
      const p = data4.product;
      const titleName = p.product_name || p.product_name_en;
      const extractedWeight = parseWeight(p, titleName);
      console.log(`✅ [API 4 MATCH] OpenBeautyFacts found product: ${titleName} (Weight: ${extractedWeight || 'N/A'})`);
      return {
        name: titleName,
        brand: p.brands || "Generic",
        category: p.categories ? p.categories.split(",")[0].trim() : "Beauty & Personal Care",
        description: p.generic_name || "No description available",
        manufacturer: p.manufacturing_places || "Unknown",
        weight: extractedWeight,
        images: p.image_url ? [{ url: p.image_url, public_id: "external_obf" }] : []
      };
    }
  } catch (err) {
    console.log("⚠️ [API 4] OpenBeautyFacts failed or timed out:", err.message);
  }

  return null;
};

// @desc    Scan barcode
// @route   POST /api/v1/products/scan-barcode
// @access  Private/Seller
export const scanBarcode = async (req, res) => {
  try {
    const { barcode } = req.body;
    if (!barcode) {
      return res.status(400).json({ success: false, message: "Barcode is required" });
    }

    // 1. Search in local MongoDB
    let product = await Product.findOne({ barcode });
    
    if (product) {
      console.log(`✅ [LOCAL DB MATCH] Product found in MongoDB for barcode: ${barcode}`);
      return res.status(200).json({
        success: true,
        found: true,
        product
      });
    }

    // 2. Query external barcode APIs in waterfall order
    const extProd = await fetchFromExternalBarcodeApis(barcode);

    if (extProd) {
      const newProductData = {
        name: extProd.name || "Scanned Product",
        brand: extProd.brand || "Generic",
        category: extProd.category || "General",
        description: extProd.description || "Scanned via barcode",
        manufacturer: extProd.manufacturer || "Unknown",
        weight: extProd.weight || "",
        barcode: barcode,
        barcodeType: barcode.length === 13 ? "EAN13" : barcode.length === 8 ? "EAN8" : "UPC",
        price: 0,
        stockAvailable: 0,
        isTemplate: true,
        status: "TEMPLATE",
        images: extProd.images || []
      };

      product = await Product.create(newProductData);

      return res.status(200).json({
        success: true,
        found: true,
        product
      });
    }

    // 3. Fallback: Create a blank template with the scanned barcode pre-filled
    const templateData = {
      name: "",
      brand: "",
      category: "General",
      description: "",
      manufacturer: "",
      weight: "",
      barcode: barcode,
      barcodeType: barcode.length === 13 ? "EAN13" : barcode.length === 8 ? "EAN8" : "UPC",
      price: 0,
      stockAvailable: 0,
      isTemplate: true,
      status: "TEMPLATE",
      images: []
    };

    product = await Product.create(templateData);

    return res.status(200).json({
      success: true,
      found: true,
      product,
      message: "Barcode registered. Please complete product details."
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private/Seller
export const createProduct = async (req, res) => {
  try {
    const { name, description, brand, category, price, stockAvailable, barcode, manufacturer, barcodeType, discount, weight } = req.body;
    
    // Images are handled by Multer Cloudinary storage
    let images = req.files && req.files.length > 0 ? req.files.map(file => ({
      url: file.path,
      public_id: file.filename
    })) : [];

    // If client sent existing images (like from template)
    if (req.body.images && images.length === 0) {
       try {
           const parsed = JSON.parse(req.body.images);
           if (Array.isArray(parsed)) images = parsed;
       } catch(e) {}
    }

    let product;
    if (barcode) {
      product = await Product.findOne({ barcode });
    }

    if (product) {
      // Update template or existing product
      product.name = name || product.name;
      product.description = description || product.description;
      product.brand = brand || product.brand;
      product.category = category || product.category;
      product.price = Number(price);
      product.stockAvailable = Number(stockAvailable);
      product.discount = discount ? Number(discount) : 0;
      product.sellerId = req.user.userId; // From auth token
      product.manufacturer = manufacturer || product.manufacturer;
      product.weight = weight || product.weight;
      product.barcodeType = barcodeType || product.barcodeType;
      product.isTemplate = false;
      product.status = "ACTIVE";
      if (images.length > 0) product.images = images;
      
      await product.save();
    } else {
      product = await Product.create({
        name,
        description,
        brand,
        category,
        price: Number(price),
        stockAvailable: Number(stockAvailable),
        discount: discount ? Number(discount) : 0,
        sellerId: req.user.userId, // From auth token
        images,
        barcode,
        manufacturer,
        weight,
        barcodeType,
        isTemplate: false,
        status: "ACTIVE"
      });
    }

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

    try {
      const keys = await redis.keys('products:*');
      if (keys.length > 0) await redis.del(keys);
    } catch(err) {}

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

    const { name, description, brand, category, price, stockAvailable, discount, status, deletedImages, weight, manufacturer, barcodeType } = req.body;
    
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
    if (discount !== undefined) product.discount = Number(discount);
    if (weight !== undefined) product.weight = weight;
    if (manufacturer !== undefined) product.manufacturer = manufacturer;
    if (barcodeType !== undefined) product.barcodeType = barcodeType;
    if (status) product.status = status;

    await product.save();

    try {
      await publishEvent(TOPICS.PRODUCT_EVENTS, {
        eventType: "PRODUCT_UPDATED",
        productId: product._id,
      });
    } catch(err) {}

    try {
      const keys = await redis.keys('products:*');
      if (keys.length > 0) await redis.del(keys);
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

    try {
      const keys = await redis.keys('products:*');
      if (keys.length > 0) await redis.del(keys);
    } catch(err) {}

    return res.status(200).json({ success: true, data: {} });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
