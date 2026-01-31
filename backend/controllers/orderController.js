import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js"; // Added for stock management
import Stripe from 'stripe';
import razorpay from 'razorpay';
import { sendEmail } from "../config/email.js";
import twilio from 'twilio';

const sendWhatsAppAlert = async (orderData) => {
    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);

    const message = `📦 *New Order Received!* \n\n` +
                    `👤 *Customer:* ${orderData.address.firstName} ${orderData.address.lastName}\n` +
                    `💰 *Amount:* ${orderData.currency} ${orderData.amount}\n` +
                    `📍 *Location:* ${orderData.address.city}, ${orderData.address.state}\n` +
                    `📄 *Items:* ${orderData.items.length} items.\n\n` +
                    `Check the PhilaBasket Admin panel for details.`;

    try {
        await client.messages.create({
            from: 'whatsapp:+14155238886', // Twilio Sandbox Number
            to: `whatsapp:${process.env.OWNER_PHONE}`, // Your Number (e.g., +919876543210)
            body: message
        });
    } catch (error) {
        console.error("WhatsApp Alert Failed:", error);
    }
};

const deliveryCharge = 10;
const USD_TO_INR = 83;

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const razorpayInstance = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) 
    ? new razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET }) 
    : null;

// --- HELPER: Unified HTML Template ---
const getOrderHtmlTemplate = (name, items, amount, currency, trackingNumber = null) => {
    const itemRows = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${currency === 'USD' ? '$' : '₹'}${item.price}</td>
        </tr>
    `).join('');

    const symbol = currency === 'USD' ? '$' : '₹';
    const statusHeader = trackingNumber ? 'Your Stamps are Shipped!' : 'Order Confirmed!';
    const themeColor = trackingNumber ? '#219EBC' : '#E63946';

    return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
        <div style="background-color: ${themeColor}; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${statusHeader}</h1>
        </div>
        <div style="padding: 20px; color: #333;">
            <p>Hi <strong>${name}</strong>,</p>
            ${trackingNumber ? `
                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #bae6fd; margin-bottom: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #0369a1;"><strong>India Post Consignment No:</strong></p>
                    <h2 style="margin: 5px 0; color: #0c4a6e;">${trackingNumber}</h2>
                    <a href="https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?p1=${trackingNumber}" 
                       style="display: inline-block; background: #0c4a6e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; font-weight: bold;">
                       Track on India Post Portal
                    </a>
                </div>
            ` : `<p>We have received your order! We are carefully packing your new treasures for dispatch.</p>`}
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead style="background: #f9f9f9;">
                    <tr><th style="text-align: left; padding: 10px;">Item</th><th style="padding: 10px;">Qty</th><th style="text-align: right; padding: 10px;">Price</th></tr>
                </thead>
                <tbody>${itemRows}</tbody>
                <tfoot>
                    <tr><td colspan="2" style="padding: 10px; font-weight: bold; text-align: right;">Total Paid:</td>
                    <td style="padding: 10px; font-weight: bold; text-align: right; color: ${themeColor}; font-size: 16px;">${symbol}${amount.toFixed(2)}</td></tr>
                </tfoot>
            </table>
        </div>
    </div>`;
};

// --- FEATURE: Stock Management Utility ---
const updateStock = async (items, type = "reduce") => {
    for (const item of items) {
        const quantity = type === "reduce" ? -item.quantity : item.quantity;
        await productModel.findByIdAndUpdate(item._id || item.productId, { $inc: { stock: quantity } });
    }
};

// --- PLACING ORDERS ---

const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address, currency, usePoints, pointsUsed } = req.body;
        const orderData = { userId, items, address, amount, currency: currency || 'INR', paymentMethod: "COD", payment: false, date: Date.now(), pointsUsed: pointsUsed || 0 };

        const newOrder = new orderModel(orderData);
        await newOrder.save();
        await updateStock(items, "reduce");

        await sendEmail(address.email, "PhilaBasket - Order Confirmed", getOrderHtmlTemplate(address.firstName, items, amount, currency));

        const updateData = { $set: { cartData: {} } };
        if (usePoints && pointsUsed > 0) updateData.$inc = { totalRewardPoints: -Math.abs(pointsUsed) };
        await userModel.findByIdAndUpdate(userId, updateData);

        await sendWhatsAppAlert(orderData);

        res.json({ success: true, message: "Order Placed" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ... (Stripe and Razorpay logic updated similarly with updateStock and sendEmail)

// --- FEATURE: Cancel Order with Points Refund ---
// controllers/orderController.js

 const cancelOrder = async (req, res) => {
    try {
        const { orderId, userId } = req.body;
        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        // --- THE LOGISTIC GUARD ---
        // Block cancellation if order has progressed to Shipped or beyond
        const restrictedStatuses = ['Shipped', 'Out for delivery', 'Delivered'];
        if (restrictedStatuses.includes(order.status)) {
            return res.json({ 
                success: false, 
                message: `Order is already ${order.status.toLowerCase()} and cannot be cancelled.` 
            });
        }

        // 1. Mark status as Cancelled
        await orderModel.findByIdAndUpdate(orderId, { status: 'Cancelled' });

        // 2. Restore Stock
        for (const item of order.items) {
            await productModel.findByIdAndUpdate(item._id, { $inc: { stock: item.quantity } });
        }

        // 3. Refund Reward Points if they were used
        if (order.pointsUsed > 0) {
            await userModel.findByIdAndUpdate(userId, { $inc: { totalRewardPoints: order.pointsUsed } });
        }

        res.json({ success: true, message: "Order cancelled successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

const placeOrderRazorpay = async (req, res) => {
    try {
        const { userId, items, amount, address, currency, usePoints, pointsUsed } = req.body;
        const orderData = { userId, items, address, amount, currency: currency || 'INR', paymentMethod: "Razorpay", payment: false, date: Date.now(), pointsUsed: pointsUsed || 0 };
        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const options = { amount: Math.round(amount * 100), currency: (currency || 'INR').toUpperCase(), receipt: newOrder._id.toString() };
        await razorpayInstance.orders.create(options, (error, order) => {
            if (error) return res.json({ success: false, message: error });
            res.json({ success: true, order });
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address, currency, usePoints, pointsUsed } = req.body;
        const { origin } = req.headers;

        const orderData = { userId, items, address, amount, currency: currency || 'INR', paymentMethod: "Stripe", payment: false, date: Date.now(), pointsUsed: pointsUsed || 0 };
        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const line_items = items.map((item) => ({
            price_data: { currency: (currency || 'INR').toLowerCase(), product_data: { name: item.name }, unit_amount: Math.round(item.price * 100) },
            quantity: item.quantity
        }));
        line_items.push({ price_data: { currency: (currency || 'INR').toLowerCase(), product_data: { name: 'Delivery Charges' }, unit_amount: deliveryCharge * 100 }, quantity: 1 });

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items, mode: 'payment',
        });

        if (usePoints && pointsUsed > 0) await userModel.findByIdAndUpdate(userId, { $inc: { totalRewardPoints: -Math.abs(pointsUsed) } });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// --- STATUS UPDATE ---

const updateStatus = async (req, res) => {
    try {
        const { orderId, status, trackingNumber } = req.body;
        
        // If tracking number is added, force status to Shipped if currently placed/packing
        let finalStatus = status;
        if (trackingNumber && (status === 'Order Placed' || status === 'Packing')) {
            finalStatus = 'Shipped';
        }

        const updateFields = { status: finalStatus };
        if (trackingNumber) updateFields.trackingNumber = trackingNumber;

        // Logic for reward points on delivery
        if (finalStatus === 'Delivered') {
            const order = await orderModel.findById(orderId);
            if (order.status !== 'Delivered') {
                updateFields.payment = true;
                const earnedPoints = Math.floor(order.amount * 0.10);
                await userModel.findByIdAndUpdate(order.userId, { $inc: { totalRewardPoints: earnedPoints } });
            }
        }

        await orderModel.findByIdAndUpdate(orderId, updateFields);

        // Send Shipping Email
        if (finalStatus === 'Shipped' && trackingNumber) {
            const order = await orderModel.findById(orderId);
            await sendEmail(order.address.email, "PhilaBasket - Items Shipped", getOrderHtmlTemplate(order.address.firstName, order.items, order.amount, order.currency, trackingNumber));
        }

        res.json({ success: true, message: "Status Updated", currentStatus: finalStatus });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ... (Rest of Analytics and Verification logic remain as provided)


// controllers/orderController.js

const verifyStripe = async (req, res) => {
    const { orderId, success, userId } = req.body;
    try {
        if (success === "true") {
            const order = await orderModel.findByIdAndUpdate(orderId, { payment: true });
            const earnedPoints = Math.floor(order.amount * 0.10);
            await userModel.findByIdAndUpdate(userId, { 
                cartData: {},
                $inc: { totalRewardPoints: earnedPoints } 
            });
            res.json({ success: true });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const verifyRazorpay = async (req, res) => {
    try {
        const { userId, razorpay_order_id } = req.body;
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

        if (orderInfo.status === 'paid') {
            const order = await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
            const earnedPoints = Math.floor(order.amount * 0.10);
            await userModel.findByIdAndUpdate(userId, { 
                cartData: {},
                $inc: { totalRewardPoints: earnedPoints }
            });
            res.json({ success: true, message: "Payment Successful" });
        } else {
            res.json({ success: false, message: 'Payment Failed' });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// --- ANALYTICS & DASHBOARD ---

const getDetailedAnalytics = async (req, res) => {
    try {
        const USD_TO_INR = 83;
        const filter = { $or: [{ payment: true }, { status: "Delivered" }] };

        const recentOrders = await orderModel.find(filter).sort({ date: -1 }).limit(10).populate('userId', 'email totalRewardPoints referralCount referralCode').lean();

        const topBuyers = await orderModel.aggregate([
            { $match: filter },
            {
                $project: {
                    userId: 1,
                    convertedAmount: {
                        $cond: {
                            if: { $eq: ["$currency", "USD"] },
                            then: { $multiply: ["$amount", USD_TO_INR] },
                            else: "$amount"
                        }
                    }
                }
            },
            { $group: { _id: "$userId", totalSpent: { $sum: "$convertedAmount" }, orderCount: { $sum: 1 } }},
            {
                $lookup: {
                    from: "users",
                    let: { orderUserId: "$_id" }, 
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", { $toObjectId: "$$orderUserId" }] } } }
                    ],
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            { $project: { 
                _id: 1,
                name: "$userDetails.name", 
                email: "$userDetails.email", 
                totalSpent: 1, 
                orderCount: 1 
            }},
            { $sort: { totalSpent: -1 } },
            { $limit: 10 }
        ]);

        res.json({ success: true, recentOrders, topBuyers });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const getAdminDashboardStats = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        const users = await userModel.find({});
        
        const USD_TO_INR = 83;
        const totalSystemPoints = users.reduce((acc, user) => acc + (user.totalRewardPoints || 0), 0);
        const totalReferrals = users.reduce((acc, user) => acc + (user.referralCount || 0), 0);

        // --- UPDATED REVENUE LOGIC ---
        // Only sum the amount if status is 'Delivered'
        const totalRevenue = orders.reduce((acc, order) => {
            if (order.status === 'Delivered') {
                const amt = order.currency === 'USD' ? order.amount * USD_TO_INR : order.amount;
                return acc + (amt || 0);
            }
            return acc;
        }, 0);

        // Update Order Count to reflect only delivered orders if you want metrics to stay proportional
        const deliveredOrders = orders.filter(o => o.status === 'Delivered');
        const orderCount = deliveredOrders.length;
        const avgOrderValue = orderCount > 0 ? (totalRevenue / orderCount).toFixed(2) : 0;

        // Update Sales Trend to only include delivered orders
        const salesTrend = await orderModel.aggregate([
            { $match: { status: "Delivered" } }, // Add this filter
            {
                $project: {
                    month: { $month: { $add: [new Date(0), "$date"] } },
                    year: { $year: { $add: [new Date(0), "$date"] } },
                    convertedAmount: {
                        $cond: {
                            if: { $eq: ["$currency", "USD"] },
                            then: { $multiply: ["$amount", USD_TO_INR] },
                            else: "$amount"
                        }
                    }
                }
            },
            {
                $group: { 
                    _id: { month: "$month", year: "$year" }, 
                    sales: { $sum: "$convertedAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        res.json({
            success: true,
            stats: {
                totalRevenue, 
                orderCount, 
                totalUsers: users.length,
                totalReferrals,
                totalSystemPoints,
                avgOrderValue, 
                salesTrend: salesTrend.map(s => ({ 
                    date: `${s._id.month}/${s._id.year}`, 
                    sales: s.sales, 
                    orders: s.orders 
                }))
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const allOrders = async (req, res) => {
    try {
        // We MUST populate 'userId' to get email, points, and referral stats
        const orders = await orderModel.find({})
            .populate('userId', 'name email totalRewardPoints referralCount referralCode wishlistData')
            .lean(); 
        
        res.json({ success: true, orders });
    } catch (error) {
        console.error("Registry Sync Error:", error);
        res.json({ success: false, message: error.message });
    }
}
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await orderModel.find({ userId });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export { 
    verifyRazorpay, verifyStripe, placeOrder, placeOrderStripe, 
    placeOrderRazorpay, allOrders, userOrders, updateStatus, 
    getAdminDashboardStats, getDetailedAnalytics ,updateStock,cancelOrder
};