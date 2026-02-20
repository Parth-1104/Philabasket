import mongoose from 'mongoose';
import productModel from './models/productModel.js';
import categoryModel from './models/categoryModel.js';
import dotenv from 'dotenv';
dotenv.config();

const migrate = async () => {
    try {
        // Use your provided connection string
        await mongoose.connect('mongodb+srv://singhparth427:parth427@cluster0.632ns.mongodb.net/e-commerce');
        console.log("Connected to Registry...");

        // 1. Unwind and Count
        const stats = await productModel.aggregate([
            // Breaks the category array into individual documents for counting
            { $unwind: "$category" }, 
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        console.log(`Found ${stats.length} unique category tags across all products.`);

        // 2. Prepare Bulk Operations
        const bulkOps = stats.map(stat => ({
            updateOne: {
                // Match the name string (e.g., "Block of Four")
                filter: { name: stat._id }, 
                update: { $set: { productCount: stat.count } },
                upsert: false 
            }
        }));

        // 3. Reset all counts to 0 (Crucial for categories that might now have 0 products)
        await categoryModel.updateMany({}, { $set: { productCount: 0 } });

        // 4. Execute Bulk Write
        if (bulkOps.length > 0) {
            const result = await categoryModel.bulkWrite(bulkOps);
            console.log(`Successfully updated ${result.modifiedCount} registry entries.`);
        }

        // 5. Verify Sample
        const sample = await categoryModel.findOne({ name: "Block of Four" });
        console.log("Verification Sample (Block of Four):", sample);

        process.exit(0);
    } catch (error) {
        console.error("Migration Failed:", error);
        process.exit(1);
    }
};

migrate();