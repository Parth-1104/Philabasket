import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    group: { type: String, default: "Independent" },
    productCount: { type: Number, default: 0 } // New field for tracking counts
});

categorySchema.index({ group: 1 });

const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema);

export default categoryModel;