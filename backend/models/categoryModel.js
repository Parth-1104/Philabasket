import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    group: { type: String, default: "Independent" }
});

// ADD THIS: Indexing the group field for faster Registry Index lookups
categorySchema.index({ group: 1 });

const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema);

export default categoryModel;