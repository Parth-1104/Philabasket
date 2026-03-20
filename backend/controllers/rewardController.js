// controllers/rewardController.js
import groupedLedgerModel from "../models/groupedLedgerModel.js";
import userModel from "../models/userModel.js";

export const getUnifiedHistory = async (req, res) => {
    try {
        const userId = req.user?.userId || req.body.userId;

        if (!userId) {
            return res.json({ success: false, message: "Authentication Failed" });
        }

        // 1. Get User Email
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // 2. Fetch their specific grouped document
        const userLedger = await groupedLedgerModel.findOne({ email: user.email }).lean();
        
        // If they don't have a ledger yet, return an empty array so the frontend shows the empty state gracefully
        if (!userLedger || !userLedger.transactions) {
            return res.json({ success: true, history: [] });
        }

        // 3. Format the transactions array for your React component
        const formattedHistory = userLedger.transactions.map(entry => {
            const credit = Number(entry.credit_points) || 0;
            const debit = Number(entry.debit_points) || 0;
            const isNegative = debit > 0;
            const amount = isNegative ? debit : credit;

            let type = 'OTHER';
            let title = 'Registry Adjustment';

            // Map the CSV action_process_type to your Frontend Titles
            if (entry.action_process_type === 'point_for_purchase') {
                type = 'ORDER_EARN';
                title = 'Order Reward Credit';
            } else if (entry.action_process_type === 'coupon_generated') {
                type = 'VOUCHER';
                title = 'Coupon Generated';
            } else if (entry.action_process_type === 'starting_point') {
                type = 'STARTING_BALANCE';
                title = 'Account Initialized';
            }

            // Extract Order Number if it's hidden in the note
            let actualOrderNo = null;
            const orderMatch = entry.note?.match(/order\s*#?(\d+)/i);
            if (orderMatch) {
                actualOrderNo = Number(orderMatch[1]);
            }

            return {
                _id: entry.id || Math.random().toString(), // Fallback ID
                type: type,
                title: title,
                description: entry.note || 'Ledger Transaction',
                amount: amount,
                createdAt: new Date(entry.created_at * 1000), // Convert Unix to Date
                isNegative: isNegative,
                status: isNegative ? 'used' : 'completed',
                orderNo: actualOrderNo
            };
        });

        // 4. Sort newest to oldest
        const sortedHistory = formattedHistory.sort((a, b) => b.createdAt - a.createdAt);

        res.json({ success: true, history: sortedHistory });

    } catch (error) {
        console.error("Grouped Ledger Sync Error:", error);
        res.json({ success: false, message: "Archive connection failed." });
    }
};
// import rewardTransactionModel from "../models/rewardTranscationModel.js";
// import userRewardModel from "../models/userRewardModel.js";
// import userModel from "../models/userModel.js"; // Needed to link ID to Email

// import orderModel from "../models/orderModel.js"; // Ensure this is imported

// export const getUnifiedHistory = async (req, res) => {
//     try {
//         const userId = req.user?.userId || req.body.userId;

//         if (!userId) {
//             return res.json({ success: false, message: "Authentication Failed" });
//         }

//         const user = await userModel.findById(userId);
//         if (!user) {
//             return res.json({ success: false, message: "User not found" });
//         }

//         const email = user.email;

//         const [transactions, coupons] = await Promise.all([
//             rewardTransactionModel.find({ userEmail: email }).lean(),
//             userRewardModel.find({ email: email }).lean()
//         ]);

//         // 1. Format Coupons
//         const formattedCoupons = coupons.map(c => {
//             const rawAmount = c.pointsUsed || c.require_point || 0;
//             const isNegative = rawAmount < 0; 

//             return {
//                 _id: c._id,
//                 type: 'VOUCHER',
//                 title: c.name || `Registry Adjustment`,
//                 description: c.description || `Adjustment Ref: ${c.discountCode}`,
//                 amount: Math.abs(rawAmount), 
//                 status: 'used',
//                 createdAt: c.createdAt,
//                 isNegative: isNegative 
//             };
//         });

//         // 2. Format Transactions with OrderNo Lookup
//         const formattedTransactions = await Promise.all(transactions.map(async (t) => {
//             const rawAmount = t.rewardAmount || 0;
//             const isRedemption = t.actionType === 'redeem_point' || rawAmount < 0;

//             let actualOrderNo = null;
//             if (t.orderId) {
//                 // Lookup the sequential orderNo from the Order collection
//                 const orderData = await orderModel.findById(t.orderId).select('orderNo').lean();
//                 actualOrderNo = orderData ? orderData.orderNo : null;
//             }

//             return {
//                 _id: t._id,
//                 type: isRedemption ? 'ORDER_REDEEM' : 'ORDER_EARN',
//                 title: isRedemption ? 'Registry Debit' : 'Registry Credit',
//                 description: t.description || 'Acquisition Reward Transaction',
//                 amount: Math.abs(rawAmount),
//                 createdAt: t.createdAt,
//                 isNegative: isRedemption,
//                 status: t.status || 'completed',
//                 orderNo: actualOrderNo, // The sequential number from your Schema
//                 orderId: t.orderId // For link reference
//             };
//         }));

//         // 3. Merge and Sort
//         const combinedHistory = [...formattedCoupons, ...formattedTransactions].sort((a, b) => {
//             return new Date(b.createdAt) - new Date(a.createdAt);
//         });

//         res.json({ success: true, history: combinedHistory });

//     } catch (error) {
//         console.error("Ledger Sync Error:", error);
//         res.json({ success: false, message: "Archive connection failed." });
//     }
// };
// };