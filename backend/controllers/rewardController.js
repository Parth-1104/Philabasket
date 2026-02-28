import rewardTransactionModel from "../models/rewardTranscationModel.js";
import userRewardModel from "../models/userRewardModel.js";
import userModel from "../models/userModel.js"; // Needed to link ID to Email

export const getUnifiedHistory = async (req, res) => {
    try {
        // 1. Safely decode the user information
        // We check req.user (standard) and fallback to req.body.userId (common in your project)
        const userId = req.user?.userId || req.body.userId;

        if (!userId) {
            return res.json({ success: false, message: "Authentication Failed: User ID missing" });
        }

        // 2. Fetch the user's email from the database
        // Your transactions use 'userEmail' as the primary key for history
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found in Registry" });
        }

        const email = user.email;

        // 3. Fetch from both the Transaction Ledger and the Coupon Registry using email
        const [transactions, coupons] = await Promise.all([
            rewardTransactionModel.find({ userEmail: email }).lean(),
            userRewardModel.find({ email: email }).lean()
        ]);

        // 4. Format Coupons (Redemptions for Vouchers)
        const formattedCoupons = coupons.map(c => ({
            _id: c._id,
            type: 'VOUCHER',
            title: `Voucher: ${c.discountCode}`,
            description: c.description || `Converted ${c.pointsUsed || c.require_point} points`,
            amount: c.pointsUsed || c.require_point,
            status: c.status,
            createdAt: c.createdAt,
            isNegative: true 
        }));

        // 5. Format Transactions (Order Earnings, Redemptions, or Refunds)
        const formattedTransactions = transactions.map(t => ({
            _id: t._id,
            type: t.actionType === 'earn_point' ? 'CASHBACK' : 'REDEMPTION',
            title: t.actionType === 'earn_point' ? 'Registry Earning' : 'Points Redeemed',
            description: t.orderId ? `Order #${t.orderId}` : 'Point Adjustment',
            amount: t.rewardAmount,
            createdAt: t.createdAt,
            isNegative: t.actionType === 'redeem_point'
        }));

        // 6. Merge and Sort by Date (Newest First)
        const combinedHistory = [...formattedCoupons, ...formattedTransactions].sort((a, b) => {
            const dateA = a.createdAt?.$date ? new Date(a.createdAt.$date) : new Date(a.createdAt);
            const dateB = b.createdAt?.$date ? new Date(b.createdAt.$date) : new Date(b.createdAt);
            return dateB - dateA;
        });

        res.json({ success: true, history: combinedHistory });

    } catch (error) {
        console.error("Ledger Fetch Error:", error);
        res.json({ success: false, message: "Archive connection failed." });
    }
};