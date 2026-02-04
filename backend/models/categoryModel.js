// models/categoryModel.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    // Only 'name' needs to be unique
    name: { type: String, required: true, unique: true },
    date: { type: Number, default: Date.now }
});

// This prevents the slug_1 index from causing issues
const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema);
export default categoryModel;