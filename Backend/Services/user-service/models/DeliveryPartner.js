import mongoose from "mongoose";

const deliveryPartnerSchema = new mongoose.Schema(
  {
    authUserId: { type: String, required: true, index: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    vehicleType: {
      type: String,
      enum: ["BICYCLE", "BIKE", "SCOOTER"],
      default: "BIKE",
    },
    vehicleNumber: { type: String, default: "" },
    licenseNumber: { type: String, default: "" },
    isOnline: { type: Boolean, default: false },
    currentStatus: {
      type: String,
      enum: ["AVAILABLE", "BUSY", "OFFLINE"],
      default: "OFFLINE",
    },
    // Persistent GeoJSON location (updated occasionally, live tracking is in Redis)
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
    rating: { type: Number, default: 5.0 },
    totalDeliveries: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 2dsphere index for Geo queries
deliveryPartnerSchema.index({ location: "2dsphere" });

export const DeliveryPartner = mongoose.model("DeliveryPartner", deliveryPartnerSchema);
