import categoryModel from '../models/categoryModel.js';

// 1. ADD CATEGORY
// controllers/categoryController.js
 const addCategory = async (req, res) => {
    try {
        const { name, group } = req.body;
        // Verify group is being passed here
        const category = new categoryModel({ 
            name: name.trim(), 
            group: group?.trim() || 'Independent' 
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
        const categories = await categoryModel.find({});
        res.json({ success: true, categories });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// 3. UPDATE (Move to Group or Rename)
const updateCategory = async (req, res) => {
    try {
        const { id, name, group } = req.body;
        await categoryModel.findByIdAndUpdate(id, { name, group });
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

export { addCategory, listCategories, removeCategory, updateCategory };