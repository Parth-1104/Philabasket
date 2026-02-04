import categoryModel from "../models/categoryModel.js";

const listCategories = async (req, res) => {
    try {
        // Index is gone, we can just fetch now
        const categories = await categoryModel.find({}).sort({ name: 1 });
        res.json({ success: true, categories });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// --- ADDED: Helper to remove a category (Useful for typos in CSV) ---
const removeCategory = async (req, res) => {
    try {
        const { id } = req.body;
        await categoryModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Category purged from registry" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export { listCategories, removeCategory };