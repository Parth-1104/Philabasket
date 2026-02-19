import categoryModel from '../models/categoryModel.js';
import productModel from '../models/productModel.js'; // Import product model for sync

// 1. ADD CATEGORY
const addCategory = async (req, res) => {
    try {
        const { name, group } = req.body;
        const category = new categoryModel({ 
            name: name.trim(), 
            group: group?.trim() || 'Independent',
            productCount: 0 // Initialize at zero for manual adds
        });
        await category.save();
        res.json({ success: true, message: "Category Registered" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// 2. LIST ALL
const listCategories = async (req, res) => {
    try {
        // Sort by group then name for a cleaner Admin UI
        const categories = await categoryModel.find({}).sort({ group: 1, name: 1 });
        res.json({ success: true, categories });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// 3. UPDATE
// 3. UPDATE (Support for both ID and Name lookups)
const updateCategory = async (req, res) => {
    try {
        const { id, name, group } = req.body;

        if (id) {
            // Standard update by ID
            await categoryModel.findByIdAndUpdate(id, { name, group });
        } else if (name) {
            // Sync update by Name (used by CategoryManager search logic)
            await categoryModel.findOneAndUpdate({ name: name }, { group: group });
        } else {
            return res.json({ success: false, message: "Identification (ID or Name) required" });
        }

        res.json({ success: true, message: "Architecture Updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// 4. REMOVE
const removeCategory = async (req, res) => {
    try {
        await categoryModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Category Purged" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// 5. RESET ALL COUNTS (Run this before your CSV upload)
const resetCategoryCounts = async (req, res) => {
    try {
        await categoryModel.updateMany({}, { $set: { productCount: 0 } });
        res.json({ success: true, message: "All Registry counts reset to zero. Ready for CSV upload." });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export { addCategory, listCategories, removeCategory, updateCategory, resetCategoryCounts };