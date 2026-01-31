import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Stripe from 'stripe';
import razorpay from 'razorpay';
import { sendEmail } from "../config/email.js";
import twilio from 'twilio';

// --- CONFIGURATION ---
const deliveryCharge = 10;
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

const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address, currency, pointsUsed } = req.body;
        const orderData = { userId, items, address, amount, currency: currency || 'INR', paymentMethod: "COD", payment: false, date: Date.now(), pointsUsed: pointsUsed || 0 };
        const newOrder = new orderModel(orderData);
        await newOrder.save();
        await updateStock(items, "reduce");
        await sendEmail(address.email, "PhilaBasket - Order Confirmed", getOrderHtmlTemplate(address.firstName, items, amount, currency));
        await userModel.findByIdAndUpdate(userId, { $set: { cartData: {} }, $inc: { totalRewardPoints: -Math.abs(pointsUsed || 0) } });
        await sendWhatsAppAlert(orderData);
        res.json({ success: true, message: "Order Placed" });
    } catch (error) { res.json({ success: false, message: error.message }); }
};

const cancelOrder = async (req, res) => {
    try {
        const { orderId, userId } = req.body;
        const order = await orderModel.findById(orderId);
        if (!order || ['Shipped', 'Out for delivery', 'Delivered'].includes(order.status)) {
            return res.json({ success: false, message: "Cannot cancel order in current status" });
        }
        await orderModel.findByIdAndUpdate(orderId, { status: 'Cancelled' });
        await updateStock(order.items, "restore");
        if (order.pointsUsed > 0) await userModel.findByIdAndUpdate(userId, { $inc: { totalRewardPoints: order.pointsUsed } });
        res.json({ success: true, message: "Order cancelled" });
    } catch (error) { res.json({ success: false, message: error.message }); }
};

const updateStatus = async (req, res) => {
    try {
        const { orderId, status, trackingNumber } = req.body;
        let finalStatus = (trackingNumber && (status === 'Order Placed' || status === 'Packing')) ? 'Shipped' : status;
        const updateFields = { status: finalStatus };
        if (trackingNumber) updateFields.trackingNumber = trackingNumber;

        if (finalStatus === 'Delivered') {
            const order = await orderModel.findById(orderId);
            if (order.status !== 'Delivered') {
                updateFields.payment = true;
                const earnedPoints = Math.floor(order.amount * 0.10);
                await userModel.findByIdAndUpdate(order.userId, { $inc: { totalRewardPoints: earnedPoints } });
            }
        }
        await orderModel.findByIdAndUpdate(orderId, updateFields);
        if (finalStatus === 'Shipped' && trackingNumber) {
            const order = await orderModel.findById(orderId);
            await sendEmail(order.address.email, "Items Shipped", getOrderHtmlTemplate(order.address.firstName, order.items, order.amount, order.currency, trackingNumber));
        }
        res.json({ success: true, currentStatus: finalStatus });
    } catch (error) { res.json({ success: false, message: error.message }); }
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

export { verifyRazorpay, verifyStripe, placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, getAdminDashboardStats, getDetailedAnalytics, updateStock, cancelOrder };