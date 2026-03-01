import mongoose from "mongoose";

const userRewardSchema = new mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String, default: "Point Conversion" },
    description: { type: String },
    discountValue: { type: Number, required: true },
    discountCode: { type: String },
    pointsUsed: { type: Number, required: true }, // Mapped from 'require_point'
    status: { type: String, enum: ['active', 'used', 'expired'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
}, { minimize: false });

const userRewardModel = mongoose.models.userReward || mongoose.model("userReward", userRewardSchema);
export default userRewardModel;