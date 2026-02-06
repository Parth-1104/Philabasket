import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true,
        index: true 
    },
    description: { type: String, required: true },
    price: { 
        type: Number, 
        required: true, 
        index: true 
    },
    marketPrice: { type: Number, required: true },
    
    // Updated: Array with a maximum of 4 image URLs
    image: { 
        type: [String], 
        required: true,
        validate: [val => val.length <= 4, '{PATH} exceeds the limit of 4 images']
    },
    
    // New: Field for YouTube Video record
    youtubeUrl: { 
        type: String, 
        default: "" 
    },
    
    category: { 
        type: [String], 
        required: true, 
        index: true 
    }, 
    year: { 
        type: Number, 
        required: true, 
        index: true 
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
        index: true 
    },
    stock: { type: Number, required: true, default: 1 },
    soldCount: { type: Number, default: 0 },
    bestseller: { type: Boolean, default: false, index: true },
    date: { 
        type: Number, 
        required: true, 
        index: true 
    },
    rewardPoints: { type: Number, default: 0 },
}, { 
    timestamps: true 
});

// Performance Indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: -1 });

// Reward Logic
productSchema.pre('save', function(next) {
    this.rewardPoints = Math.floor(this.price * 0.10); 
    next();
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

// Add these at the bottom of your productModel.js, before defining the model

// 1. Supports the 'hint' we used (Sorting by date and filtering by name)
productSchema.index({ name: 1, date: -1 });

// 2. Optimized for the "Sort by Price" in the Gallery
productSchema.index({ price: 1, date: -1 });

// 3. Optimized for Category filtering
productSchema.index({ category: 1, date: -1 });

// 4. Ensure your text index handles multiple fields for fuzzy fallback
productSchema.index({ name: 'text', country: 'text', category: 'text' });

export default productModel;