import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: [1, "Quantity can not be less than 1."] },
  price: { type: Number, required: true },
  subtotal: { type: Number, required: true },
});

const timelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerId: { type: String, required: true, index: true },
    sellerId: { type: String, required: true, index: true },
    items: [orderItemSchema],
    shippingAddress: { type: Object, required: true }, // or breakdown as { address, city, etc }
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    orderStatus: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "PROCESSING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
    razorpayOrderId: { type: String },
    deliveryPartnerId: { type: String },
    trackingNumber: { type: String },
    timeline: [timelineSchema],
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
