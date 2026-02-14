import mongoose from 'mongoose';
import fs from 'fs';
import userModel from './models/userModel.js';
import orderModel from './models/orderModel.js';

const MONGODB_URI = "mongodb+srv://singhparth427:parth427@cluster0.632ns.mongodb.net/e-commerce";

const runHybridMigration = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected. Pre-processing datasets...");

        // 1. LOAD DATASETS
        const postsData = JSON.parse(fs.readFileSync('/Users/parthpankajsingh/Desktop/ML Projects/PhilaBaskte/wp_posts.json', 'utf-8'))[2].data;
        const metaData = JSON.parse(fs.readFileSync('/Users/parthpankajsingh/Desktop/ML Projects/PhilaBaskte/wp_postmeta.json', 'utf-8'))[2].data;
        const itemsData = JSON.parse(fs.readFileSync('/Users/parthpankajsingh/Desktop/ML Projects/PhilaBaskte/wp_woocommerce_order_items.json', 'utf-8'))[2].data;
        const rewardsData = JSON.parse(fs.readFileSync('/Users/parthpankajsingh/Desktop/ML Projects/PhilaBaskte/wp_wlr_users.json', 'utf-8'))[2].data;

        // 2. BUILD LOOKUP MAPS
        const metaMap = new Map();
        metaData.forEach(m => {
            if (!metaMap.has(m.post_id)) metaMap.set(m.post_id, {});
            metaMap.get(m.post_id)[m.meta_key] = m.meta_value;
        });

        const rewardMap = new Map();
        rewardsData.forEach(r => rewardMap.set(r.user_email.toLowerCase(), r));

        const orderItemsGrouped = itemsData.reduce((acc, item) => {
            if (!acc[item.order_id]) acc[item.order_id] = [];
            acc[item.order_id].push({ name: item.order_item_name, quantity: 1, price: 0 });
            return acc;
        }, {});

        // 3. START ORDER LOOP
        const shopOrders = postsData.filter(p => p.post_type === 'shop_order');
        console.log(`Processing ${shopOrders.length} orders...`);

        for (let post of shopOrders) {
            const orderId = post.ID;
            const orderMeta = metaMap.get(orderId) || {};
            const billingEmail = orderMeta['_billing_email']?.toLowerCase();

            if (!billingEmail) continue;

            // --- USER LOGIC ---
            let user = await userModel.findOne({ email: billingEmail });

            if (!user) {
                // If user is missing, create a profile using Reward Data or Fallbacks
                const rData = rewardMap.get(billingEmail);
                user = await userModel.create({
                    name: billingEmail.split('@')[0], // Fallback name
                    email: billingEmail,
                    password: "MIGRATED_USER_TEMP_PASS_123", 
                    totalRewardPoints: rData ? Number(rData.points) : 0,
                    referralCode: rData?.refer_code || "PHILA-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
                    createdAt: new Date(post.post_date)
                });
                console.log(`[CREATED MISSING USER] ${billingEmail}`);
            }

            // --- ORDER LOGIC ---
            const orderData = {
                userId: user._id,
                items: orderItemsGrouped[orderId] || [],
                amount: Number(orderMeta['_order_total']) || 0,
                address: {
                    street: orderMeta['_billing_address_1'] || "Migrated",
                    phone: orderMeta['_billing_phone'] || "0000000000",
                    city: orderMeta['_billing_city'] || "Archive",
                    state: orderMeta['_billing_state'] || "Archive",
                    zipCode: orderMeta['_billing_postcode'] || "000000"
                },
                status: post.post_status === 'wc-completed' ? 'Delivered' : 'Order Placed',
                paymentMethod: orderMeta['_payment_method_title'] || "WordPress Migrated",
                payment: true,
                date: new Date(post.post_date).getTime(),
                currency: orderMeta['_order_currency'] || "INR"
            };

            await orderModel.findOneAndUpdate(
                { date: orderData.date, userId: user._id },
                orderData,
                { upsert: true }
            );
        }

        console.log("Hybrid Migration Finished Successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Critical Failure:", err);
        process.exit(1);
    }
};

runHybridMigration();