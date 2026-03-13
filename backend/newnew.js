import xlsx from 'xlsx';
import mongoose from 'mongoose';
import orderModel from './models/orderModel.js';
import userModel from './models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

const BACKUP_FILE = '/Users/parthpankajsingh/Desktop/ML Projects/test/wp_wlr_user_rewards.csv';

const cleanupLegacyEntries = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`);
        console.log("✅ Connected to PhilaBasket Registry");

        // 1. Load Excel to map Order Numbers to Names
        const workbook = xlsx.readFile(BACKUP_FILE);
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        
        const wpNameMap = new Map();
        rows.forEach(row => {
            const orderNo = parseInt(row['Order Number'] || row['ID']);
            const fName = (row['First Name (Billing)'] || "").trim();
            const lName = (row['Last Name (Billing)'] || "").trim();
            if (orderNo) {
                wpNameMap.set(orderNo, { 
                    fName, 
                    lName, 
                    fullName: `${fName} ${lName}`.trim() 
                });
            }
        });

        // 2. Find all orders that currently show "Legacy Entry" or have no userId
        const problematicOrders = await orderModel.find({
            $or: [
                { userId: { $exists: false } },
                { userId: "696b5cf3cbfa2614b4bcffe3" }, // Your placeholder ID
                { "address.firstName": "Legacy" }
            ]
        });

        console.log(`🔍 Found ${problematicOrders.length} orders needing name/ID repair...`);

        let repaired = 0;

        for (const order of problematicOrders) {
            const wpData = wpNameMap.get(order.orderNo);
            
            if (wpData) {
                // Find the actual user in the user table (e.g., Vivek Divakar)
                const actualUser = await userModel.findOne({
                    name: { $regex: new RegExp(`^${wpData.fullName}$`, 'i') }
                });

                const updateData = {
                    "address.firstName": wpData.fName,
                    "address.lastName": wpData.lName,
                };

                if (actualUser) {
                    updateData.userId = actualUser._id;
                }

                await orderModel.findByIdAndUpdate(order._id, { $set: updateData });
                repaired++;
            }
        }

        console.log(`\n🎉 Repair Complete!`);
        console.log(`Fixed Identity for: ${repaired} orders`);

    } catch (err) {
        console.error("❌ Repair Error:", err);
    } finally {
        await mongoose.connection.close();
    }
};

cleanupLegacyEntries();