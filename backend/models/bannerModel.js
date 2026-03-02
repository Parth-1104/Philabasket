import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    image: { type: String, required: true },
    title: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    date: { type: Number, required: true }
});

const bannerModel = mongoose.models.banner || mongoose.model("banner", bannerSchema);
export default bannerModel;