import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: "India" },
    location: {
      type: { type: String, enum: ["Point"] },
      coordinates: { type: [Number], default: undefined }, // [longitude, latitude]
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    phone: { type: String, default: "" },
    bio: { type: String, default: "" },
    profileImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    addresses: [addressSchema],
  },
  { timestamps: true }
);

// Index for Geospatial queries (e.g. shops near me based on customer address)
userProfileSchema.index({ "addresses.location": "2dsphere" });

export const UserProfile = mongoose.model("UserProfile", userProfileSchema);
