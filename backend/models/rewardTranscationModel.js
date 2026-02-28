import mongoose from "mongoose";

const rewardTransactionSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    actionType: { type: String, enum: ['earn_point', 'redeem_point'], required: true },
    orderId: { type: String },
    orderTotal: { type: Number },
    rewardAmount: { type: Number, required: true }, // Points amount
    discountCode: { type: String }, // Linked if it's a coupon use
    createdAt: { type: Date, default: Date.now },
}, { minimize: false });

const rewardTransactionModel = mongoose.models.rewardTransaction || mongoose.model("rewardTransaction", rewardTransactionSchema);
export default rewardTransactionModel;