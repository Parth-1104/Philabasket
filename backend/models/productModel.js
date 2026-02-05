import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true,
        index: true // Fast lookup for specific titles
    },
    description: { type: String, required: true },
    price: { 
        type: Number, 
        required: true, 
        index: true // Crucial for "Sort by Price" performance
    },
    marketPrice: { type: Number, required: true },
    image: { type: Array, required: true },
    
    // Changed to String array with indexing for the filter sidebar
    category: { 
        type: [String], 
        required: true, 
        index: true 
    }, 
    
    year: { 
        type: Number, 
        required: true, 
        index: true // Fast filtering by era
    },
    condition: { 
        type: String, 
        required: true, 
        enum: ['Mint', 'Used', 'Fine', 'Near Mint'],
        index: true
    }, 
    country: { 
        type: String, 
        required: true, 
        index: true // Fast filtering by origin
    },
    stock: { type: Number, required: true, default: 1 },
    soldCount: { type: Number, default: 0 },
    bestseller: { type: Boolean, default: false, index: true },
    date: { 
        type: Number, 
        required: true, 
        index: true // Sorting by "Newest Arrivals"
    },
    rewardPoints: { type: Number, default: 0 },
}, { 
    timestamps: true // Automatically manages createdAt and updatedAt
});

// --- PERFORMANCE INDEXES ---

// 1. Text Index: Enables "Search" across name and description simultaneously
productSchema.index({ name: 'text', description: 'text' });

// 2. Compound Index: Optimizes the "Collection" page (Category + Price sorting)
productSchema.index({ category: 1, price: -1 });

// --- REWARD LOGIC ---
productSchema.pre('save', function(next) {
    this.rewardPoints = Math.floor(this.price * 0.10); 
    next();
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;