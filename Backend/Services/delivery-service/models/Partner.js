import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema(
  {
    partnerId: { type: String, required: true, unique: true },
    isOnline: { type: Boolean, default: false },
    // If the user wants area or km radius, we would need location here, but for now we just store online status
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  { timestamps: true }
);

partnerSchema.index({ location: "2dsphere" });

export default mongoose.model("Partner", partnerSchema);
