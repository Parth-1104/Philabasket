// backend/newmitigate.js
import mongoose from 'mongoose';
import userModel from './models/userModel.js';// CHECK THIS PATH
import dotenv from 'dotenv';

dotenv.config();

const migrateTiers = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`);
        console.log("Connected to Registry Database...");

        console.log("Running Bulk Tier Update...");

        // Define the ranges
        const ops = [
            {
                updateMany: {
                    filter: { totalRewardPoints: { $gte: 500000 } },
                    update: { $set: { tier: 'Platinum' } }
                }
            },
            {
                updateMany: {
                    filter: { totalRewardPoints: { $gte: 300000, $lt: 500000 } },
                    update: { $set: { tier: 'Gold' } }
                }
            },
            {
                updateMany: {
                    filter: { totalRewardPoints: { $lt: 300000 } },
                    update: { $set: { tier: 'Silver' } }
                }
            }
        ];

        const result = await userModel.bulkWrite(ops);

        console.log(`--- Migration Complete ---`);
        console.log(`Matched: ${result.matchedCount} | Modified: ${result.modifiedCount}`);
        process.exit(0);
    } catch (error) {
        console.error("Migration Failed:", error.message);
        process.exit(1);
    }
};

migrateTiers();