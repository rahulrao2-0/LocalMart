import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    brand: {
      type: String,
      default: "Generic",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
      default: 0
    },
    stockAvailable: {
      type: Number,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    discount: {
      type: Number,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
      default: 0,
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String },
      },
    ],
    sellerId: {
      type: String,
      index: true,
    },
    barcode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    barcodeType: {
      type: String,
    },
    manufacturer: {
      type: String,
    },
    weight: {
      type: String,
      default: "",
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "DELETED", "TEMPLATE"],
      default: "ACTIVE",
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
