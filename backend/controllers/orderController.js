import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe';
import razorpay from 'razorpay';

// Global variables
const deliveryCharge = 10;

// Gateway initialization logic (Ensure these are defined in your .env)
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const razorpayInstance = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) 
    ? new razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET }) 
    : null;

// --- PLACING ORDERS ---

const placeOrder = async (req, res) => {
    try {
        // 1. Destructure pointsUsed (which we added to the frontend payload earlier)
        const { userId, items, amount, address, currency, usePoints, pointsUsed } = req.body;

        const orderData = {
            userId, 
            items, 
            address, 
            amount, // This is the final price after discount (can be 0)
            currency: currency || 'INR',
            paymentMethod: "COD", 
            payment: false, 
            date: Date.now()
        };

        // 2. Save the new order
        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // 3. Prepare the user update
        // We always clear the cart after a successful order
        const updateData = { 
            $set: { cartData: {} } 
        };

        // 4. FIX: Use $inc with a negative value to deduct ONLY the required points
        if (usePoints && pointsUsed > 0) {
            updateData.$inc = { totalRewardPoints: -Math.abs(pointsUsed) };
        }

        // 5. Update user record in one database call
        await userModel.findByIdAndUpdate(userId, updateData);

        res.json({ success: true, message: "Order Placed Successfully" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address, currency, usePoints } = req.body;
        const { origin } = req.headers;

        const orderData = {
            userId, items, address, amount,
            currency: currency || 'INR',
            paymentMethod: "Stripe", payment: false, date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const line_items = items.map((item) => ({
            price_data: {
                currency: (currency || 'INR').toLowerCase(),
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
        }));

        line_items.push({
            price_data: {
                currency: (currency || 'INR').toLowerCase(),
                product_data: { name: 'Delivery Charges' },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        });

        if (usePoints) await userModel.findByIdAndUpdate(userId, { totalRewardPoints: 0 });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const placeOrderRazorpay = async (req, res) => {
    try {
        const { userId, items, amount, address, currency } = req.body;
        const orderData = {
            userId, items, address, amount,
            currency: currency || 'INR',
            paymentMethod: "Razorpay", payment: false, date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const options = {
            amount: Math.round(amount * 100),
            currency: (currency || 'INR').toUpperCase(),
            receipt: newOrder._id.toString()
        };

        await razorpayInstance.orders.create(options, (error, order) => {
            if (error) return res.json({ success: false, message: error });
            res.json({ success: true, order });
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// --- VERIFICATION & STATUS ---

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

const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const order = await orderModel.findById(orderId);

        const updateFields = { status };
        
        // If Delivered, ensure it's marked as paid for analytics tracking
        if (status === 'Delivered') {
            updateFields.payment = true;
            if (order.status !== 'Delivered' && order.paymentMethod === 'COD') {
                const earnedPoints = Math.floor(order.amount * 0.10);
                await userModel.findByIdAndUpdate(order.userId, {
                    $inc: { totalRewardPoints: earnedPoints }
                });
            }
        }

        await orderModel.findByIdAndUpdate(orderId, updateFields);
        res.json({ success: true, message: "Status Updated & Data Synced" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// --- ANALYTICS & DASHBOARD ---

const getDetailedAnalytics = async (req, res) => {
    try {
        const USD_TO_INR = 83;
        const filter = { $or: [{ payment: true }, { status: "Delivered" }] };

        const recentOrders = await orderModel.find(filter).sort({ date: -1 }).limit(10).lean();

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
        // Use .lean() for faster read-only performance in analytics
        const orders = await orderModel.find({}).lean(); 
        res.json({ success: true, orders });
    } catch (error) {
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
    getAdminDashboardStats, getDetailedAnalytics 
};