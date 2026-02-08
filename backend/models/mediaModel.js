// models/mediaModel.js
import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
    originalName: { type: String, required: true, unique: true }, // e.g., "penny_black.jpg"
    imageUrl: { type: String, required: true },
    isAssigned: { type: Boolean, default: false },
    public_id: { type: String, required: true },
});

const mediaModel = mongoose.models.media || mongoose.model("media", mediaSchema);
export default mediaModel;