import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Stripe from 'stripe';
import razorpay from 'razorpay';
import { sendEmail } from "../config/email.js";
import twilio from 'twilio';
import 'dotenv/config';
import axios from 'axios';
import rewardTransactionModel from "../models/rewardTranscationModel.js";
import userRewardModel from "../models/userRewardModel.js";


const recordRewardActivity = async (userId, userEmail, amount, type, orderId = null) => {
    try {
        // 1. Update the User's live balance
        await userModel.findByIdAndUpdate(userId, { 
            $inc: { totalRewardPoints: amount } 
        });

        // 2. Create the Archive Ledger Entry
        const transaction = new rewardTransactionModel({
            userEmail: userEmail,
            actionType: type, // 'earn_point' or 'redeem_point'
            rewardAmount: Math.abs(amount),
            orderId: orderId,
            createdAt: new Date()
        });
        await transaction.save();
    } catch (error) {
        console.error("Ledger Sync Failed:", error);
    }
};


// --- CONFIGURATION ---
const deliveryCharge = 100;
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const razorpayInstance = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) 
    ? new razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET }) 
    : null;

// --- UTILITIES ---
const sendWhatsAppAlert = async (orderData) => {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    const message = `📦 *New Order Received!* \n\n` +
                    `👤 *Customer:* ${orderData.address.firstName} ${orderData.address.lastName}\n` +
                    `💰 *Amount:* ${orderData.currency} ${orderData.amount}\n` +
                    `📍 *Location:* ${orderData.address.city}, ${orderData.address.state}\n` +
                    `📄 *Items:* ${orderData.items.length} items.`;
    try {
        await client.messages.create({ from: 'whatsapp:+14155238886', to: `whatsapp:${process.env.OWNER_PHONE}`, body: message });
    } catch (error) { console.error("WhatsApp Alert Failed:", error); }
};

// backend/controllers/orderController.js

export const getTrackingStatus = async (req, res) => {
    try {
        const { trackingNumber } = req.body;
        
        // backend/controllers/trackingController.js
const options = {
    method: 'POST',
    url: 'https://speedpost-tracking-api-for-india-post.p.rapidapi.com/track/consignment',
    timeout: 30000, // <--- Add this (30 seconds)
    headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'x-rapidapi-host': 'speedpost-tracking-api-for-india-post.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPID_API_KEY 
    },
    data: new URLSearchParams({ consignment_number: trackingNumber })
};

        const response = await axios.request(options);
        res.json({ success: true, data: response.data });
    } catch (error) {
        res.json({ success: false, message: "Tracking Registry Offline" });
    }
};

const getOrderHtmlTemplate = (name, items, amount, currency, trackingNumber = null) => {
    const itemRows = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${currency === 'USD' ? '$' : '₹'}${item.price}</td>
        </tr>`).join('');
    const symbol = currency === 'USD' ? '$' : '₹';
    const themeColor = trackingNumber ? '#219EBC' : '#E63946';
    return `<div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
        <div style="background-color: ${themeColor}; color: white; padding: 20px; text-align: center;"><h1>${trackingNumber ? 'Shipped!' : 'Confirmed!'}</h1></div>
        <div style="padding: 20px;"><p>Hi <strong>${name}</strong>,</p><table><tbody>${itemRows}</tbody><tfoot><tr><td>Total Paid:</td><td>${symbol}${amount.toFixed(2)}</td></tr></tfoot></table></div></div>`;
};

const updateStock = async (items, type = "reduce") => {
    for (const item of items) {
        const quantity = type === "reduce" ? -item.quantity : item.quantity;
        await productModel.findByIdAndUpdate(item._id || item.productId, { $inc: { stock: quantity } });
    }
};

// --- CONTROLLERS ---


// import userRewardModel from "../models/userRewardModel.js"; // Ensure this path is correct







const placeOrder = async (req, res) => {
    try {
        const { 
            userId, items, amount, address, billingAddress, 
            currency, pointsUsed, couponUsed, discountAmount, 
            paymentMethod, status 
        } = req.body;

        // 1. BLOCK DOUBLE COUPON USAGE
        if (couponUsed) {
            const alreadyUsed = await userRewardModel.findOne({ 
                discountCode: couponUsed, 
                email: address.email, 
                status: 'used' 
            });

            if (alreadyUsed) {
                return res.json({ 
                    success: false, 
                    message: `Security Alert: Coupon ${couponUsed} has already been recorded in your Archive.` 
                });
            }
        }

        // 2. CONSTRUCT ORDER DATA
        const orderData = {
            userId,
            items,
            address,
            billingAddress: billingAddress || address,
            amount,
            pointsUsed: pointsUsed || 0,
            couponUsed: couponUsed || null,
            discountAmount: discountAmount || 0,
            currency: currency || 'INR',
            // Set method to 'Cheque' if selected, otherwise default to provided or COD
            paymentMethod: paymentMethod || "COD", 
            payment: false,
            date: Date.now(),
            // Initial status for Cheque is 'Cheque on Hold'
            status: status || (paymentMethod === 'Cheque' ? 'Cheque on Hold' : 'Order Placed')
        };

        // 3. SAVE ORDER TO DATABASE
        const newOrder = new orderModel(orderData);
        await newOrder.save(); 

        // 4. RECORD USAGE IN USER REWARD TABLE
        if (couponUsed) {
            const usedEntry = new userRewardModel({
                email: address.email,
                rewardName: "Coupon Redeemed",
                description: `Acquisition Discount via ${couponUsed}`,
                discountValue: discountAmount,
                discountCode: couponUsed,
                pointsUsed: discountAmount,
                status: 'used',
                createdAt: new Date()
            });
            await usedEntry.save();
        }

        // 5. DEDUCT REWARD POINTS
        if (pointsUsed > 0) {
            await recordRewardActivity(
                userId, 
                address.email, 
                -Math.abs(pointsUsed), 
                'redeem_point', 
                newOrder._id
            );
        }

        // 6. UPDATE INVENTORY (Deduct Stock)
        for (const item of items) {
            await productModel.findByIdAndUpdate(item._id, { 
                $inc: { stock: -item.quantity } 
            });
        }

        // 7. CLEAN USER CART REGISTRY
        await userModel.findByIdAndUpdate(userId, { $set: { cartData: {} } });

        // 8. FINAL SUCCESS RESPONSE
        res.json({ 
            success: true, 
            message: paymentMethod === 'Cheque' 
                ? "Acquisition secured. Order is 'On Hold' awaiting cheque clearance." 
                : "Order Placed & Reward Logged.", 
            orderNo: newOrder.orderNo 
        });

    } catch (error) {
        console.error("Order Placement Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};


        




const cancelOrder = async (req, res) => {
    try {
        // userId comes from the authUser middleware, orderId from the body
        const { orderId, userId } = req.body; 
        
        const order = await orderModel.findById(orderId);
        
        if (!order) {
            return res.json({ success: false, message: "Registry Entry not found." });
        }

        // BLOCK: Prevent cancellation if already in transit
        const blockedStatuses = ['Shipped', 'Out for delivery', 'Delivered', 'Cancelled'];
        if (blockedStatuses.includes(order.status)) {
            return res.json({ success: false, message: `Cannot cancel: Order is currently ${order.status}` });
        }

        // 1. Update Status
        await orderModel.findByIdAndUpdate(orderId, { status: 'Cancelled' });
        
        // 2. Restore Stock
        await updateStock(order.items, "restore");

        // 3. Refund points (Record as 'earn_point' to show as a positive refund in ledger)
        if (order.pointsUsed > 0) {
            const user = await userModel.findById(userId);
            // This will increment the user's balance back and add a ledger entry
            await recordRewardActivity(userId, user.email, order.pointsUsed, 'earn_point', orderId);
        }

        res.json({ success: true, message: "Acquisition terminated. Points restored to Vault." });
    } catch (error) { 
        res.json({ success: false, message: error.message }); 
    }
};

const updateSoldCount = async (items) => {
    for (const item of items) {
        // Increment soldCount by the quantity purchased
        await productModel.findByIdAndUpdate(item._id || item.productId, { 
            $inc: { soldCount: item.quantity } 
        });
    }
};


const updateStatus = async (req, res) => {
    try {
        const { orderId, status, trackingNumber } = req.body;
        
        const currentOrder = await orderModel.findById(orderId);
        if (!currentOrder) {
            return res.json({ success: false, message: "Order not found" });
        }

        // Logic for auto-shipping if tracking number is added
        let finalStatus = (trackingNumber && (status === 'Order Placed' || status === 'Packing')) ? 'Shipped' : status;
        
        const updateFields = { status: finalStatus };
        if (trackingNumber) updateFields.trackingNumber = trackingNumber;

        // --- REWARD LOGIC: TRIGGER ONLY ONCE ---
        if (finalStatus === 'Delivered' && currentOrder.status !== 'Delivered') {
            updateFields.payment = true;

            const earnedPoints = Math.floor(currentOrder.amount * 0.10);

            // Record points and create ledger entry
            await recordRewardActivity(
                currentOrder.userId, 
                currentOrder.address.email, 
                earnedPoints, 
                'earn_point', 
                currentOrder._id
            );

            await updateSoldCount(currentOrder.items);
            console.log(`Registry Ledger Updated: ${earnedPoints} points awarded.`);
        }

        // --- THE FIX: REMOVED THE 'RETURN' BLOCK ---
        // Instead of returning an error if already delivered, we simply 
        // skip the reward logic above and proceed to save the status.
        
        await orderModel.findByIdAndUpdate(orderId, updateFields);
        
        // Handle Email logic for shipping...
        if (finalStatus === 'Shipped' && trackingNumber) {
            await sendEmail(
                currentOrder.address.email, 
                "Items Shipped", 
                getOrderHtmlTemplate(currentOrder.address.firstName, currentOrder.items, currentOrder.amount, currentOrder.currency, trackingNumber)
            );
        }

        res.json({ success: true, message: "Status Updated", currentStatus: finalStatus });

    } catch (error) { 
        console.error("Status Update Error:", error);
        res.json({ success: false, message: error.message }); 
    }
};

// --- ANALYTICS ---

const getDetailedAnalytics = async (req, res) => {
    try {
        const filter = { $or: [{ payment: true }, { status: "Delivered" }] };
        const recentOrders = await orderModel.find(filter).sort({ date: -1 }).limit(10).populate('userId', 'email totalRewardPoints referralCount referralCode').lean();

        const topBuyers = await orderModel.aggregate([
            { $match: filter },
            { $group: { _id: "$userId", totalSpent: { $sum: "$amount" }, orderCount: { $sum: 1 } } },
            { $lookup: { from: "users", let: { oId: "$_id" }, pipeline: [{ $match: { $expr: { $eq: ["$_id", { $toObjectId: "$$oId" }] } } }], as: "u" } },
            { $unwind: "$u" },
            { $project: { name: "$u.name", email: "$u.email", referralCount: "$u.referralCount", totalSpent: 1, orderCount: 1 } },
            { $sort: { totalSpent: -1 } }, { $limit: 10 }
        ]);
        res.json({ success: true, recentOrders, topBuyers });
    } catch (error) { res.json({ success: false, message: error.message }); }
};

const getAdminDashboardStats = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        const users = await userModel.find({});
        const deliveredOrders = orders.filter(o => o.status === 'Delivered');

        // Total Revenue (Direct Sum)
        const totalRevenue = deliveredOrders.reduce((acc, o) => acc + (o.amount || 0), 0);

        // Top Selling Product
        const pSales = {};
        deliveredOrders.forEach(o => o.items.forEach(i => pSales[i.name] = (pSales[i.name] || 0) + i.quantity));
        const topProduct = Object.entries(pSales).map(([name, qty]) => ({ name, qty })).sort((a,b) => b.qty - a.qty)[0] || { name: "N/A", qty: 0 };

        const salesTrendData = await orderModel.aggregate([
            { $match: { status: "Delivered" } },
            {
                $project: {
                    dateStr: { 
                        $dateToString: { 
                            format: "%Y-%m-%d", 
                            date: { $add: [new Date(0), "$date"] } 
                        } 
                    },
                    amount: "$amount"
                }
            },
            {
                $group: { 
                    _id: "$dateStr", 
                    sales: { $sum: "$amount" }, 
                    orders: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } } 
        ]);
        
        // Inside the stats object in res.json:
        // salesTrend: salesTrend.map(s => ({ 
        //     date: s._id, // This will be "2026-01-30", "2026-01-31", etc.
        //     sales: s.sales, 
        //     orders: s.orders 
        // }))

        res.json({ success: true, stats: { 
            totalRevenue, 
            orderCount: deliveredOrders.length, 
            totalUsers: users.length, 
            topProduct, 
            totalReferrals: users.reduce((acc, u) => acc + (u.referralCount || 0), 0),
            totalSystemPoints: users.reduce((acc, u) => acc + (u.totalRewardPoints || 0), 0),
            salesTrend: salesTrendData.map(s => ({ 
                date: s._id, // Sends "2026-01-31" to fix "Invalid Date"
                sales: s.sales, 
                orders: s.orders 
            }))
        }});
    } catch (error) { res.json({ success: false, message: error.message }); }
};

const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).populate('userId', 'name email totalRewardPoints referralCount referralCode').lean(); 
        res.json({ success: true, orders });
    } catch (error) { res.json({ success: false, message: error.message }); }
};

const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, orders });
    } catch (error) { res.json({ success: false, message: error.message }); }
};



// ... (Rest of Analytics and Verification logic remain as provided)


// controllers/orderController.js

const verifyStripe = async (req, res) => {
};

const verifyRazorpay = async (req, res) => {
};

const placeOrderRazorpay = async (req, res) => {
};

const placeOrderStripe = async (req, res) => {
};






export  const syncLegacyOrderDetails = async (req, res) => {
    try {
        // 1. Find orders that are "Legacy" (missing the new firstName field)
        const ordersToFix = await orderModel.find({
            $or: [
                { "address.firstName": { $exists: false } },
                { "address.firstName": "" }
            ]
        });

        let successCount = 0;
        let skipCount = 0;

        for (const order of ordersToFix) {
            // Handle both ObjectId and $oid string formats
            const userId = order.userId?.$oid || order.userId;
            
            // Try to find the user in the User table
            const user = await userModel.findById(userId);
            
            if (user || order.address.name) {
                // Determine the Name: User Table Name > address.name fallback > Email prefix
                const fullName = user?.name || order.address.name || user?.email?.split('@')[0] || "Collector";
                
                // Split the name for your new Schema (FirstName/LastName)
                const nameParts = fullName.trim().split(" ");
                const firstName = nameParts[0];
                const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Legacy";

                // Prepare the patched address object
                const patchedAddress = {
                    ...order.address, // Keep existing street, city, etc.
                    firstName: firstName,
                    lastName: lastName,
                    email: user?.email || order.address.email || "N/A"
                };

                // Remove the old 'name' key if it exists to keep the object clean
                delete patchedAddress.name;

                // Update existing record strictly
                await orderModel.findByIdAndUpdate(order._id, {
                    $set: { 
                        address: patchedAddress,
                        // Fix date format if it's currently a MongoDB object
                        date: typeof order.date === 'object' ? Number(order.date.$numberLong) : order.date
                    }
                });
                successCount++;
            } else {
                skipCount++;
            }
        }

        res.json({
            success: true,
            message: `Migration finished. Updated: ${successCount}, Skipped: ${skipCount}`
        });

    } catch (error) {
        console.error("Migration Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};







export { verifyRazorpay, verifyStripe, placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, getAdminDashboardStats, getDetailedAnalytics, updateStock, cancelOrder };