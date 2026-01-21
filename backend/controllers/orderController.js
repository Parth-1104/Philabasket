import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe'
import razorpay from 'razorpay'

// global variables
const deliveryCharge = 10

// gateway initialize
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

//const razorpayInstance = new razorpay({
  //  key_id : process.env.RAZORPAY_KEY_ID,
    //key_secret : process.env.RAZORPAY_KEY_SECRET,
//})

// Placing orders using COD Method
const placeOrder = async (req,res) => {
    
    try {
        
        const { userId, items, amount, address, currency } = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            currency: currency || 'INR',
            paymentMethod:"COD",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId,{cartData:{}})

        res.json({success:true,message:"Order Placed"})


    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// Placing orders using Stripe Method
const placeOrderStripe = async (req,res) => {
    try {
        
        const { userId, items, amount, address} = req.body
        const { origin } = req.headers;

        const orderData = {
            userId,
            items,
            address,
            amount,
            currency: currency || 'INR',
            paymentMethod:"Stripe",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const line_items = items.map((item) => ({
            price_data: {
                currency: (currency || 'INR').toLowerCase(), // Stripe expects lowercase
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100) // Ensure integers for Stripe
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: (currency || 'INR').toLowerCase(),
                product_data: { name: 'Delivery Charges' },
                unit_amount: defaultDeliveryCharge * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:  `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        })

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Verify Stripe 
const verifyStripe = async (req,res) => {

    const { orderId, success, userId } = req.body

    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, {payment:true});
            await userModel.findByIdAndUpdate(userId, {cartData: {}})
            res.json({success: true});
        } else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({success:false})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req,res) => {
    try {
        const { userId, items, amount, address, currency } = req.body

        const orderData = {
            userId,
            items,
            address,
            amount,
            currency: currency || 'INR', // Save currency
            paymentMethod: "Razorpay",
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const options = {
            amount: Math.round(amount * 100),
            currency: (currency || 'INR').toUpperCase(), // Razorpay expects uppercase
            receipt : newOrder._id.toString()
        }

        await razorpayInstance.orders.create(options, (error, order)=>{
            if (error) {
                return res.json({ success: false, message: error })
            }
            res.json({ success: true, order })
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyRazorpay = async (req,res) => {
    try {
        
        const { userId, razorpay_order_id  } = req.body

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        if (orderInfo.status === 'paid') {
            await orderModel.findByIdAndUpdate(orderInfo.receipt,{payment:true});
            await userModel.findByIdAndUpdate(userId,{cartData:{}})
            res.json({ success: true, message: "Payment Successful" })
        } else {
             res.json({ success: false, message: 'Payment Failed' });
        }

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


// All Orders data for Admin Panel
const allOrders = async (req,res) => {

    try {
        
        const orders = await orderModel.find({})
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// User Order Data For Forntend
const userOrders = async (req,res) => {
    try {
        
        const { userId } = req.body

        const orders = await orderModel.find({ userId })
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// update order status from Admin Panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const order = await orderModel.findById(orderId);

        // Logic: If status becomes 'Delivered', credit reward points
        if (status === 'Delivered' && order.status !== 'Delivered') {
            const earnedPoints = Math.floor(order.amount * 0.10); // 10% of order value
            
            await userModel.findByIdAndUpdate(order.userId, {
                $inc: { totalRewardPoints: earnedPoints }
            });
        }

        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: "Status Updated & Points Credited" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Add this to your orderController.js
 const getAdminDashboardStats = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        const users = await userModel.find({});
        
        // Detailed Financials
        const totalRevenue = orders.reduce((acc, order) => acc + (order.amount || 0), 0);
        const orderCount = orders.length;
        const avgOrderValue = orderCount > 0 ? (totalRevenue / orderCount).toFixed(2) : 0;

        // Retention Logic (Repeat Customers)
        const userOrderCounts = {};
        orders.forEach(o => userOrderCounts[o.userId] = (userOrderCounts[o.userId] || 0) + 1);
        const repeatCustomers = Object.values(userOrderCounts).filter(count => count > 1).length;
        const repeatRate = users.length > 0 ? ((repeatCustomers / users.length) * 100).toFixed(1) : 0;

        // Monthly Sales Trend (Last 6 Months)
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
                totalRevenue,
                orderCount,
                totalUsers: users.length,
                avgOrderValue,
                repeatCustomerRate: repeatRate,
                salesTrend: salesTrend.map(s => ({ 
                    date: `${s._id.month}/${s._id.year}`, 
                    sales: s.sales, 
                    orders: s.orders 
                })),
                // Add your existing lowStock and category logic here
            }
        });
    } catch (error) { res.json({ success: false, message: error.message }); }
}

export {verifyRazorpay, verifyStripe ,placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus,getAdminDashboardStats}