import mongoose from "mongoose";

const sellerBankAccountSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true, index: true },
    accountHolderName: { type: String, required: true },
    bankName: { type: String, required: true },
    branchName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    upiId: { type: String, default: "" },
    isPrimary: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const SellerBankAccount = mongoose.model("SellerBankAccount", sellerBankAccountSchema);
