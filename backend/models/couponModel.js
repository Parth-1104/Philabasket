import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    value: { type: Number, required: true }, // e.g., 10 for 10% or 100 for ₹100
    minAmount: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
});

const couponModel = mongoose.models.coupon || mongoose.model("coupon", couponSchema);
export default couponModel;