import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    referralCode: { type: String, unique: true },
    totalRewardPoints: { type: Number, default: 0 },
    cartData: { type: Object, default: {} }
}, { minimize: false })

userSchema.pre('save', function (next) {
    if (!this.referralCode) {
        this.referralCode = "PHILA-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

const userModel = mongoose.models.user || mongoose.model('user',userSchema);

export default userModel