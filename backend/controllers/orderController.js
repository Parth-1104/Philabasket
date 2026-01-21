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
        const { userId, items, amount, address, currency, usePoints } = req.body;

        const orderData = {
            userId, items, address, amount,
            currency: currency || 'INR',
            paymentMethod: "COD", payment: false, date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const updateData = { cartData: {} };
        if (usePoints) updateData.totalRewardPoints = 0;

        await userModel.findByIdAndUpdate(userId, updateData);
        res.json({ success: true, message: "Order Placed" });
    } catch (error) {
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
        const filter = { $or: [{ payment: true }, { status: "Delivered" }] };

        // 1. Top Buyers Logic (Unchanged)
        const topBuyers = await orderModel.aggregate([
            { $match: filter },
            // Group by userId string
            { $group: { _id: "$userId", totalSpent: { $sum: "$amount" }, orderCount: { $sum: 1 } }},
            
            // JOIN with users collection using type conversion
            {
                $lookup: {
                    from: "users", // MongoDB pluralizes 'user' model to 'users'
                    let: { orderUserId: "$_id" }, 
                    pipeline: [
                        { 
                            $match: { 
                                $expr: { 
                                    $eq: ["$_id", { $toObjectId: "$$orderUserId" }] 
                                } 
                            } 
                        }
                    ],
                    as: "userDetails"
                }
            },
            
            // Flatten the array
            { $unwind: "$userDetails" },
            
            // Select final fields
            { $project: { 
                name: "$userDetails.name", 
                email: "$userDetails.email", 
                totalSpent: 1, 
                orderCount: 1 
            }},
            { $sort: { totalSpent: -1 } },
            { $limit: 10 }
        ]);

        // 2. FIXED: Most Sold Items (Grouping by items._id)
        const mostSoldProducts = await orderModel.aggregate([
            { $match: filter },
            { $unwind: "$items" },
            { 
                $group: { 
                    _id: "$items._id", // Use the unique item ID from the order
                    name: { $first: "$items.name" }, 
                    image: { $first: "$items.image" }, 
                    totalSold: { $sum: "$items.quantity" }, 
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } 
                } 
            },
            { $sort: { totalSold: -1 } }, // Sorted by most selling numbers
            { $limit: 20 } // Show all top 20 items
        ]);

        // 3. FIXED: Most in Cart (Adding Name Lookup)
        const inCartStats = await userModel.aggregate([
            // 1. Convert the cart object { "prodId": quantity } into an array
            { $project: { cartArray: { $objectToArray: "$cartData" } } },
            { $unwind: "$cartArray" },
            
            // 2. Count how many users have each product ID in their cart
            { $group: { _id: "$cartArray.k", totalInCarts: { $sum: 1 } } },
            
            // 3. JOIN with the "products" collection to get the name
            {
                $lookup: {
                    from: "products", // Ensure this matches your collection name in Compass
                    let: { prodId: "$_id" },
                    pipeline: [
                        { 
                            $match: { 
                                $expr: { $eq: ["$_id", { $toObjectId: "$$prodId" }] } 
                            } 
                        },
                        { $project: { name: 1 } }
                    ],
                    as: "productDetails"
                }
            },
            
            // 4. Flatten the result and clean up
            { $unwind: "$productDetails" },
            { 
                $project: { 
                    _id: 1, 
                    totalInCarts: 1, 
                    name: "$productDetails.name" 
                } 
            },
            { $sort: { totalInCarts: -1 } },
            { $limit: 5 }
        ]);

        res.json({ success: true, topBuyers, mostSoldProducts, inCartStats });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const getAdminDashboardStats = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        const users = await userModel.find({});
        
        const totalRevenue = orders.reduce((acc, order) => acc + (order.amount || 0), 0);
        const orderCount = orders.length;
        const avgOrderValue = orderCount > 0 ? (totalRevenue / orderCount).toFixed(2) : 0;

        const userOrderCounts = {};
        orders.forEach(o => userOrderCounts[o.userId] = (userOrderCounts[o.userId] || 0) + 1);
        const repeatCustomers = Object.values(userOrderCounts).filter(count => count > 1).length;
        const repeatRate = users.length > 0 ? ((repeatCustomers / users.length) * 100).toFixed(1) : 0;

        const salesTrend = await orderModel.aggregate([
            { $group: { 
                _id: { month: { $month: { $add: [new Date(0), "$date"] } }, year: { $year: { $add: [new Date(0), "$date"] } } }, 
                sales: { $sum: "$amount" },
                orders: { $sum: 1 }
            }},
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $limit: 6 }
        ]);

        res.json({
            success: true,
            stats: {
                totalRevenue, orderCount, totalUsers: users.length,
                avgOrderValue, repeatCustomerRate: repeatRate,
                salesTrend: salesTrend.map(s => ({ 
                    date: `${s._id.month}/${s._id.year}`, 
                    sales: s.sales, orders: s.orders 
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