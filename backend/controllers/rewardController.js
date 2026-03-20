import rewardTransactionModel from "../models/rewardTranscationModel.js";
import userRewardModel from "../models/userRewardModel.js";
import userModel from "../models/userModel.js"; // Needed to link ID to Email

import orderModel from "../models/orderModel.js"; // Ensure this is imported

export const getUnifiedHistory = async (req, res) => {
    try {
        const userId = req.user?.userId || req.body.userId;

        if (!userId) {
            return res.json({ success: false, message: "Authentication Failed" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const email = user.email;

        const [transactions, coupons] = await Promise.all([
            rewardTransactionModel.find({ userEmail: email }).lean(),
            userRewardModel.find({ email: email }).lean()
        ]);

        // 1. Format Coupons
        const formattedCoupons = coupons.map(c => {
            const rawAmount = c.pointsUsed || c.require_point || 0;
            const isNegative = rawAmount < 0; 

            return {
                _id: c._id,
                type: 'VOUCHER',
                title: c.name || `Registry Adjustment`,
                description: c.description || `Adjustment Ref: ${c.discountCode}`,
                amount: Math.abs(rawAmount), 
                status: 'used',
                createdAt: c.createdAt,
                isNegative: isNegative 
            };
        });

        // 2. Format Transactions with OrderNo Lookup
        // 2. Format Transactions
        const formattedTransactions = await Promise.all(transactions.map(async (t) => {
            const rawAmount = t.rewardAmount || 0;
            const isRedemption = t.actionType === 'redeem_point' || rawAmount < 0;

            let actualOrderNo = null;
            
            if (t.orderId) {
                // If it's a valid 24-character MongoDB ObjectId, query the database
                if (t.orderId.length === 24) {
                    const orderData = await orderModel.findById(t.orderId).select('orderNo').lean();
                    actualOrderNo = orderData ? orderData.orderNo : null;
                } else {
                    // If it's already the sequential number (like "50284"), just use it!
                    actualOrderNo = Number(t.orderId);
                }
            }

            return {
                _id: t._id,
                type: isRedemption ? 'ORDER_REDEEM' : 'ORDER_EARN',
                title: isRedemption ? 'Registry Debit' : 'Registry Credit',
                description: t.description || 'Acquisition Reward Transaction',
                amount: Math.abs(rawAmount),
                createdAt: t.createdAt,
                isNegative: isRedemption,
                status: t.status || 'completed',
                orderNo: actualOrderNo, // Safely assigned now
                orderId: t.orderId
            };
        }));

        // 3. Merge and Sort
        const combinedHistory = [...formattedCoupons, ...formattedTransactions].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        res.json({ success: true, history: combinedHistory });

    } catch (error) {
        console.error("Ledger Sync Error:", error);
        res.json({ success: false, message: "Archive connection failed." });
    }
};