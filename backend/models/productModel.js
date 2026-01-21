import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: Array, required: true },
    
    category: { type: [String], required: true }, 
    
    year: { type: Number, required: true },
    condition: { 
        type: String, 
        required: true, 
        enum: ['Mint', 'Used', 'Fine', 'Near Mint'] 
    }, 
    country: { type: String, required: true },
    stock: { type: Number, required: true, default: 1 }, // Usually low for rare stamps
    
    bestseller: { type: Boolean, default: false },
    date: { type: Number, required: true },
    rewardPoints: { type: Number, default: 0 },
})

productSchema.pre('save', function(next) {
    this.rewardPoints = Math.floor(this.price * 0.10); 
    next();
});

const productModel  = mongoose.models.product || mongoose.model("product",productSchema);

export default productModel