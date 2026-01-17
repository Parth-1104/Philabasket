import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: Array, required: true },
    
    // Multiple categories (e.g., ["Rare", "Historical", "Europe"])
    category: { type: [String], required: true }, 
    
    // Stamp-specific details
    year: { type: Number, required: true },
    condition: { 
        type: String, 
        required: true, 
        enum: ['Mint', 'Used', 'Fine', 'Near Mint'] 
    }, 
    country: { type: String, required: true },
    stock: { type: Number, required: true, default: 1 }, // Usually low for rare stamps
    
    bestseller: { type: Boolean, default: false },
    date: { type: Number, required: true }
})

const productModel  = mongoose.models.product || mongoose.model("product",productSchema);

export default productModel