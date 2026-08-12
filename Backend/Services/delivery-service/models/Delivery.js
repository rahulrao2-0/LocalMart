import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    orderNumber: { type: String, required: true },
    customerId: { type: String, required: true },
    sellerId: { type: String, required: true },
    deliveryPartnerId: { type: String, default: null }, // Null until assigned
    
    status: {
      type: String,
      enum: [
        "SEARCHING_FOR_PARTNER",
        "PARTNER_ASSIGNED",
        "HEADING_TO_STORE",
        "REACHED_STORE",
        "PICKED_UP",
        "HEADING_TO_CUSTOMER",
        "REACHED_LOCATION",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "SEARCHING_FOR_PARTNER",
    },

    pickupLocation: {
      address: { type: String },
      lat: { type: Number },
      lng: { type: Number }
    },

    dropLocation: {
      address: { type: String },
      lat: { type: Number },
      lng: { type: Number }
    },
    
    proofOfDelivery: {
      imageUrl: { type: String, default: null },
      signatureUrl: { type: String, default: null },
      verifiedByCode: { type: Boolean, default: false }
    },
    
    cancellationReason: { type: String, default: null },
    
    timeline: [
      {
        status: String,
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Delivery", deliverySchema);
