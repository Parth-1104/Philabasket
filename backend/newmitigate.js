import mongoose from 'mongoose';
import fs from 'fs';
import userModel from './models/userModel.js';

const MONGODB_URI = "mongodb+srv://singhparth427:parth427@cluster0.632ns.mongodb.net/e-commerce";


const syncAllPotentialUsers = async () => {
    try {
        await mongoose.connect("mongodb+srv://singhparth427:parth427@cluster0.632ns.mongodb.net/e-commerce");

        // 1. Load both datasets
        const wpUsers = JSON.parse(fs.readFileSync('/Users/parthpankajsingh/Desktop/ML Projects/PhilaBaskte/wp_users.json', 'utf-8'))[2].data;
        const wlrUsers = JSON.parse(fs.readFileSync('/Users/parthpankajsingh/Desktop/ML Projects/PhilaBaskte/wp_wlr_users.json', 'utf-8'))[2].data;

        // 2. Create a unique list of all emails from BOTH files
        const allEmails = new Set([
            ...wpUsers.map(u => u.user_email.toLowerCase()),
            ...wlrUsers.map(u => u.user_email.toLowerCase())
        ]);

        console.log(`Found ${allEmails.size} unique potential users. Starting Sync...`);

        for (let email of allEmails) {
            const mainUser = wpUsers.find(u => u.user_email.toLowerCase() === email);
            const rewardUser = wlrUsers.find(u => u.user_email.toLowerCase() === email);

            // Determine Name: Priority is Display Name > Login > Reward User Email
            const finalName = mainUser?.display_name || mainUser?.user_login || email.split('@')[0];

            const updateData = {
                name: finalName,
                email: email,
                totalRewardPoints: rewardUser ? Number(rewardUser.points) : 0,
            };

            await userModel.findOneAndUpdate(
                { email: email },
                { 
                    $set: updateData,
                    $setOnInsert: { 
                        // If they don't have a WP account, they get a random password they must reset
                        password: mainUser?.user_pass || "MIGRATED_GUEST_TEMP_PASS", 
                        referralCode: rewardUser?.refer_code || "PHILA-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
                        createdAt: mainUser ? new Date(mainUser.user_registered) : new Date()
                    } 
                },
                { upsert: true }
            );
        }

        console.log("Deep Sync Complete. All Reward users now have MongoDB profiles.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

syncAllPotentialUsers();