import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    referralCode: { type: String, unique: true },
    // Password Recovery Fields
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // Rewards System
    totalRewardPoints: { type: Number, default: 0 },
    // Loophole & Cap Protection
    referralCount: { type: Number, default: 0 }, 
    signupIP: { type: String }, 

    defaultAddress: {
        street: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        zipCode: { type: String, default: "" },
        phone: { type: String, default: "" }
    },
    // User Data
    wishlistData: { type: Array, default: [] },
    cartData: { type: Object, default: {} }
}, { minimize: false, timestamps: true }) // Added timestamps for better audit trails

userSchema.pre('save', function (next) {
    if (!this.referralCode) {
        this.referralCode = "PHILA-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;