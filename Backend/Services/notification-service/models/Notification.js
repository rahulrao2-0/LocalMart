import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  role: { type: String, required: false },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['PAYMENT_FAILED', 'REVIEW_RECEIVED', 'DELIVERY_ASSIGNED', 'DELIVERY_COMPLETED'],
    required: true,
  },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
