import mongoose from "mongoose";

const sellerAddressSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true, index: true },
    addressType: {
      type: String,
      enum: ["BUSINESS", "WAREHOUSE", "PICKUP", "RETURN"],
      required: true
    },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: "India" },
    postalCode: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const SellerAddress = mongoose.model("SellerAddress", sellerAddressSchema);
