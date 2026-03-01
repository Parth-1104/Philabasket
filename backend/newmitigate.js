import mongoose from 'mongoose';
import 'dotenv/config'; // Loads your MONGO_URI from .env
import orderModel from "./models/orderModel.js";
import counterModel from "./models/counterModel.js";

const migrate = async () => {
    try {
        // 1. Connect to Database
        console.log("Connecting to Registry Database...");
        await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`)

        console.log("Connection Secure.");

        // 2. Fetch all existing orders sorted by date (oldest first)
        const orders = await orderModel.find({}).sort({ date: 1 });
        console.log(`Starting migration for ${orders.length} orders...`);

        // 3. Loop through and assign numbers starting from 0 to N
        for (let i = 0; i < orders.length; i++) {
            // Updating legacy orders with low-digit sequence
            await orderModel.findByIdAndUpdate(orders[i]._id, { 
                $set: { orderNo: i } 
            });
            
            if (i % 10 === 0) console.log(`Processed ${i} orders...`);
        }

        // 4. Update/Reset the Counter for new orders
        // This ensures the NEXT order placed via the app starts at 100000
        const counter = await counterModel.findOneAndUpdate(
            { id: 'orderNumber' },
            { seq: 100000 },
            { upsert: true, new: true }
        );

        console.log(`Migration Complete.`);
        console.log(`Legacy Range: 0 - ${orders.length - 1}`);
        console.log(`Next Order will be: ${counter.seq}`);
        
        // Close connection and exit
        process.exit(0);

    } catch (error) {
        console.error("Migration Protocol Failed:", error);
        process.exit(1);
    }
};

migrate();