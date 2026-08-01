import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    authUserId: { type: String, required: true, index: true },
    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    profileImage: { type: String, default: "" },
    businessType: {
      type: String,
      enum: ["INDIVIDUAL", "RETAIL", "WHOLESALE", "MANUFACTURER"],
      required: true
    },
    gstNumber: { type: String, default: "" },
    panNumber: { type: String, default: "" },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING"
    },
    accountStatus: {
      type: String,
      enum: ["ACTIVE", "BLOCKED", "SUSPENDED"],
      default: "ACTIVE"
    },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Seller = mongoose.model("Seller", sellerSchema);
