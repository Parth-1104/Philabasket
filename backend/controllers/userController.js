import 'dotenv/config'
import validator from "validator";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import orderModel from "../models/orderModel.js";
import groupedLedgerModel from "../models/groupedLedgerModel.js"; // USING THE NEW SCHEMA

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// =========================================================================
// THE MASTER REWARD HELPER: Updates Wallet ($inc) & Ledger ($push) at once
// =========================================================================
export const recordRewardActivity = async (userId, userEmail, amount, type, orderId = null, customNote = null) => {
    try {
        const isEarn = type !== 'redeem_point'; 
        const absoluteAmount = Math.abs(amount);
        const pointAdjustment = isEarn ? absoluteAmount : -absoluteAmount;

        // 1. Update live wallet
        await userModel.findByIdAndUpdate(userId, { 
            $inc: { totalRewardPoints: pointAdjustment } 
        });

        // 2. Format Ledger Schema
        let actionProcessType = isEarn ? 'point_for_purchase' : 'coupon_generated';
        if (type === 'starting_point') actionProcessType = 'starting_point';

        const newTransaction = {
            id: Math.floor(Math.random() * 10000000),
            user_email: userEmail,
            action_type: type, 
            action_process_type: actionProcessType,
            credit_points: isEarn ? absoluteAmount : 0,
            debit_points: !isEarn ? absoluteAmount : 0,
            note: customNote || (orderId ? `Registry Order #${orderId}` : 'Ledger Update'),
            created_at: Math.floor(Date.now() / 1000) 
        };

        // 3. Push to Grouped Ledger array
        await groupedLedgerModel.findOneAndUpdate(
            { email: userEmail },
            { 
                $setOnInsert: { email: userEmail },
                $push: { transactions: newTransaction }
            },
            { upsert: true, new: true }
        );
        return true;
    } catch (error) {
        console.error("Ledger Sync Failed:", error);
        return false;
    }
};

// =========================================================================
// CONTROLLERS
// =========================================================================

export const rewardReferrer = async (order) => {
    try {
        const newUser = await userModel.findById(order.userId);
        if (!newUser || !newUser.referredBy || newUser.isReferralRewardClaimed) return false;

        const referrer = await userModel.findOne({ referralCode: newUser.referredBy });
        if (!referrer) return false;
        if (newUser.signupIP === referrer.signupIP) return false;

        // Use the Master Helper to update both users
        await recordRewardActivity(referrer._id, referrer.email, 1000, 'earn_point', null, 'Referral Bonus (Invited User)');
        referrer.referralCount = (referrer.referralCount || 0) + 1;
        await referrer.save();

        await recordRewardActivity(newUser._id, newUser.email, 500, 'earn_point', null, 'Referred by Friend');
        newUser.isReferralRewardClaimed = true; 
        await newUser.save();
        
        return true;
    } catch (error) {
        console.error("Referral Reward Error:", error);
        return false;
    }
}

export const impersonateUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: "Collector record not found in registry." });

        console.log(`ADMIN ACTION: Impersonating user ${user.email}`);
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ success: true, token, user: { name: user.name, email: user.email, totalRewardPoints: user.totalRewardPoints }});
    } catch (error) {
        res.json({ success: false, message: "Internal Registry Error" });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { idToken, referrerCode } = req.body;
        const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
        const { name, email, picture } = ticket.getPayload();
        
        let user = await userModel.findOne({ email });

        if (!user) {
            user = await userModel.create({
                name, email, image: picture,
                password: Date.now() + Math.random().toString(),
                totalRewardPoints: 0, referralCount: 0 // Initialize at 0, Helper will add points
            });

            // Log starting points to ledger
            await recordRewardActivity(user._id, user.email, 1000, 'starting_point', null, 'Account Initialized');

            if (referrerCode) {
                await rewardReferrer(referrerCode, user, req.ip || req.headers['x-forwarded-for']);
            }
        }
        const token = createToken(user._id);
        res.json({ success: true, token });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

const registerUser = async (req, res) => {
    try {
        const { name, email, password, referrerCode } = req.body;
        if (await userModel.findOne({ email })) return res.json({ success: false, message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name, email, password: hashedPassword,
            totalRewardPoints: 0, referralCount: 0, referredBy: req.body.referrerCode || null, 
            signupIP: req.ip
        });

        const user = await newUser.save();

        // Log starting points to ledger
        await recordRewardActivity(user._id, user.email, 1000, 'starting_point', null, 'Account Initialized');

        if (referrerCode) {
            await rewardReferrer(referrerCode, user, req.ip || req.headers['x-forwarded-for']);
        }

        const token = createToken(user._id);
        res.json({ success: true, token });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.json({ success: false, message: "Registry email not found." });

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }});
        const frontendUrl = process.env.FRONTEND_URL;
        if (!frontendUrl) return res.json({ success: false, message: "Registry protocol error." });

        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
        const mailOptions = {
            to: user.email, from: 'PhilaBasket Registry <noreply@philabasket.com>',
            subject: 'Archive Access Recovery Protocol',
            text: `A recovery protocol was initiated.\n\nClick here to reset credentials:\n${resetUrl}`
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Recovery link dispatched." });
    } catch (error) { res.json({ success: false, message: error.message }); }
}

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await userModel.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) return res.json({ success: false, message: "Token is invalid or expired." });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        res.json({ success: true, message: "Credentials updated successfully." });
    } catch (error) { res.json({ success: false, message: error.message }); }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.json({ success: false, message: "User doesn't exist" })

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = createToken(user._id)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: 'Invalid credentials' })
        }
    } catch (error) { res.json({ success: false, message: error.message }) }
}

const adminLogin = async (req, res) => {
    try {
        const {email,password} = req.body
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password,process.env.JWT_SECRET);
            res.json({success:true,token})
        } else {
            res.json({success:false,message:"Invalid credentials"})
        }
    } catch (error) { res.json({ success: false, message: error.message }) }
}

const updateAddress = async (req, res) => {
    try {
        const { userId, address ,name} = req.body;
        const updatedUser = await userModel.findByIdAndUpdate(userId, { defaultAddress: address, name: name }, { new: true });
        if (!updatedUser) return res.json({ success: false, message: "User not found" });

        res.json({ success: true, message: "Address updated in the registry.", address: updatedUser.defaultAddress });
    } catch (error) { res.json({ success: false, message: error.message }); }
}

export const getTopPhilatelists = async (req, res) => {
    try {
        const results = await orderModel.aggregate([
            { $match: { payment: true } },
            { $group: { _id: "$userId", totalSpent: { $sum: "$amount" }, orderCount: { $sum: 1 } } },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userDetails" } },
            { $unwind: "$userDetails" },
            { $facet: { byRevenue: [{ $sort: { totalSpent: -1 } }, { $limit: 100 }], byFrequency: [{ $sort: { orderCount: -1 } }, { $limit: 100 }] } }
        ]);

        res.json({ success: true, topUsers: results[0].byRevenue, mostFrequent: results[0].byFrequency });
    } catch (error) { res.json({ success: false, message: error.message }); }
};

export const getPhilatelistDetail = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await userModel.findById(userId).populate('orders');
        if (!user) return res.json({ success: false, message: "User not found" });

        const totalSpent = user.orders.filter(o => o.payment === true).reduce((acc, order) => acc + (order.amount || 0), 0);
        res.json({ success: true, user: { ...user._doc, orders: user.orders, totalSpent } });
    } catch (error) { res.json({ success: false, message: error.message }); }
};

const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.body; 
        const user = await userModel.findById(userId).select("-password");
        if (!user) return res.json({ success: false, message: "User not found" });
        res.json({ success: true, user });
    } catch (error) { res.json({ success: false, message: error.message }); }
}

const listUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).select('name email');
        res.json({ success: true, users });
    } catch (error) { res.json({ success: false, message: error.message }); }
}

export const getAllUsersData = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", sortCoins } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = search ? {
            $or: [
                { name: { $regex: search.trim(), $options: 'i' } },
                { email: { $regex: search.trim(), $options: 'i' } },
                { referralCode: { $regex: search.trim(), $options: 'i' } }
            ]
        } : {};

        let sortCriteria = { createdAt: -1 }; 
        if (sortCoins === 'desc') sortCriteria = { totalRewardPoints: -1 };
        else if (sortCoins === 'asc') sortCriteria = { totalRewardPoints: 1 };

        const totalUsers = await userModel.countDocuments(query);
        const users = await userModel.find(query).select('-password').sort(sortCriteria).skip(skip).limit(parseInt(limit));

        res.json({ success: true, users, totalPages: Math.ceil(totalUsers / parseInt(limit)), currentPage: parseInt(page) });
    } catch (error) { res.json({ success: false, message: error.message }); }
};

export const getSingleUserDetail = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await userModel.findById(userId).populate('orders');
        res.json({ success: true, user });
    } catch (error) { res.json({ success: false, message: error.message }); }
};

export const adjustRewardPoints = async (req, res) => {
    try {
        const { userId, amount, action, description } = req.body;
        const numAmount = Number(amount);

        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: "Collector not found" });

        let pointsChange = 0;
        if (action === 'add') {
            pointsChange = numAmount;
        } else if (action === 'subtract') {
            pointsChange = -Math.min(numAmount, user.totalRewardPoints || 0); // Don't drop below 0
        } else if (action === 'overwrite') {
            pointsChange = numAmount - (user.totalRewardPoints || 0);
        }

        if (pointsChange !== 0) {
            const type = pointsChange > 0 ? 'earn_point' : 'redeem_point';
            const note = description || `Manual adjustment by Archive Administrator (${action.toUpperCase()})`;
            await recordRewardActivity(userId, user.email, Math.abs(pointsChange), type, null, note);
        }

        const freshUser = await userModel.findById(userId); // Fetch fresh state
        res.json({ success: true, message: `Registry updated. Balance: ${freshUser.totalRewardPoints} PTS`, newBalance: freshUser.totalRewardPoints });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const users = await userModel.find({
            $or: [{ name: { $regex: query, $options: 'i' } }, { email: { $regex: query, $options: 'i' } }]
        }).limit(5);
        res.json({ success: true, users });
    } catch (error) { res.json({ success: false, message: error.message }); }
};

export const getUnifiedHistoryAdmin = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.json({ success: false, message: "Collector email required" });

        const userLedger = await groupedLedgerModel.findOne({ email }).lean();
        if (!userLedger || !userLedger.transactions) return res.json({ success: true, history: [] });

        const formattedHistory = userLedger.transactions.map(entry => {
            const credit = Number(entry.credit_points) || 0;
            const debit = Number(entry.debit_points) || 0;
            const isNegative = debit > 0;
            const amount = isNegative ? debit : credit;

            let type = 'OTHER';
            let title = 'Registry Adjustment';

            if (entry.action_process_type === 'point_for_purchase') {
                type = 'ORDER_EARN'; title = 'Order Reward Credit';
            } else if (entry.action_process_type === 'coupon_generated') {
                type = 'VOUCHER'; title = 'Coupon Generated';
            } else if (entry.action_process_type === 'starting_point') {
                type = 'STARTING_BALANCE'; title = 'Account Initialized';
            }

            let actualOrderNo = null;
            const orderMatch = entry.note?.match(/order\s*#?(\d+)/i);
            if (orderMatch) actualOrderNo = Number(orderMatch[1]);

            return {
                _id: entry.id || Math.random().toString(),
                type: type, title: title, description: entry.note || 'Ledger Transaction',
                amount: amount, createdAt: new Date(entry.created_at * 1000),
                isNegative: isNegative, status: isNegative ? 'used' : 'completed', orderNo: actualOrderNo
            };
        });

        const sortedHistory = formattedHistory.sort((a, b) => b.createdAt - a.createdAt);
        res.json({ success: true, history: sortedHistory });
    } catch (error) {
        res.json({ success: false, message: "Archive connection failed." });
    }
};

export const updateTriviaScore = async (req, res) => {
    try {
        const { userId, points } = req.body;
        if (!userId || points === undefined) return res.json({ success: false, message: "User ID and points required" });

        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: "User not found" });

        user.triviaScore = (user.triviaScore || 0) + points;
        await user.save();
        res.json({ success: true, message: "Score updated", newScore: user.triviaScore });
    } catch (error) { res.json({ success: false, message: error.message }); }
};

export const convertTriviaScoreToPoints = async (req, res) => {
    try {
        const { userId, convertAmount, multiplier = 1 } = req.body;
        const amount = Number(convertAmount);
        const rate = Number(multiplier);

        if (!userId || !amount || amount <= 0) return res.json({ success: false, message: "Valid inputs required" });

        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: "User not found" });

        const availableScore = user.triviaScore || 0;
        if (amount > availableScore) return res.json({ success: false, message: "Not enough trivia score" });

        const coins = Math.floor(amount * rate);

        user.triviaScore = availableScore - amount;
        user.triviaCoins = (user.triviaCoins || 0) + coins;
        await user.save(); // Save trivia deductions

        // Use Master Helper for points!
        await recordRewardActivity(user._id, user.email, coins, 'earn_point', null, `Converted ${amount} trivia score into ${coins} reward points`);

        const freshUser = await userModel.findById(userId);
        res.json({
            success: true, message: "Trivia score converted",
            triviaScore: freshUser.triviaScore, totalRewardPoints: freshUser.totalRewardPoints, triviaCoins: freshUser.triviaCoins
        });
    } catch (error) { res.json({ success: false, message: error.message }); }
};

export const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await userModel.find({ triviaScore: { $gt: 0 } })
            .select('name email triviaScore totalRewardPoints triviaCoins')
            .sort({ triviaScore: -1 }).limit(10);
        res.json({ success: true, leaderboard });
    } catch (error) { res.json({ success: false, message: error.message }); }
};

export { 
    googleLogin, loginUser, registerUser, adminLogin, getUserProfile, 
    forgotPassword, resetPassword, listUsers, updateAddress 
}
// import 'dotenv/config'
// import validator from "validator";
// import bcrypt from "bcrypt"
// import jwt from 'jsonwebtoken'
// import userModel from "../models/userModel.js";
// import { OAuth2Client } from 'google-auth-library';
// import crypto from 'crypto';
// import nodemailer from 'nodemailer';
// import orderModel from "../models/orderModel.js";
// // backend/controllers/userController.js
// import userRewardModel from "../models/userRewardModel.js";
// import rewardTransactionModel from '../models/rewardTranscationModel.js';



// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// const createToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET)
// }

// // --- HELPER: DUAL-REWARD & LOOPHOLE PROTECTION ---
// // --- HELPER: DUAL-REWARD WITH 3-PERSON CAP ---
// // --- HELPER: DUAL-REWARD WITH 3-PERSON CAP & IP PROTECTION ---
// // const rewardReferrer = async (referrerCode, newUser, ipAddress) => {
// //     try {
// //         if (!referrerCode || !newUser) return false;

// //         // 1. Find the inviter
// //         const referrer = await userModel.findOne({ referralCode: referrerCode });
// //         if (!referrer) return false;

// //         // 2. Self-Referral Protection
// //         if (referrer._id.toString() === newUser._id.toString()) return false;

// //         // 3. CAP PROTECTION: Limit to 3 referrals
// //         if (referrer.referralCount >= 3) return false;

// //         // 4. IP Protection: Prevent same person creating multiple accounts
// //         const duplicateIP = await userModel.findOne({ 
// //             signupIP: ipAddress, 
// //             _id: { $ne: newUser._id } 
// //         });
// //         if (duplicateIP) return false;

// //         // 5. Apply Rewards
// //         referrer.totalRewardPoints = (referrer.totalRewardPoints || 0) + 50;
// //         referrer.referralCount = (referrer.referralCount || 0) + 1;
        
// //         newUser.totalRewardPoints = (newUser.totalRewardPoints || 0) + 25;
// //         newUser.signupIP = ipAddress;

// //         await referrer.save();
// //         await newUser.save();
// //         return true;
// //     } catch (error) {
// //         console.error("Referral Error:", error);
// //         return false;
// //     }
// // }
// export const rewardReferrer = async (order) => {
//     try {
//         // 1. Identify the buyer
//         const newUser = await userModel.findById(order.userId);
        
//         // 2. Protocol Check: Must have a referrer and must NOT have been rewarded yet
//         if (!newUser || !newUser.referredBy || newUser.isReferralRewardClaimed) return false;

//         // 3. Identify the Referrer (The Inviter)
//         const referrer = await userModel.findOne({ referralCode: newUser.referredBy });
//         if (!referrer) return false;

//         // 4. IP Protection: Verify unique household to prevent "self-referral" farming
//         if (newUser.signupIP === referrer.signupIP) return false;

//         // 5. Apply Rewards
//         // Inviter gets 50 PTS
//         referrer.totalRewardPoints = (referrer.totalRewardPoints || 0) + 1000;
//         referrer.referralCount = (referrer.referralCount || 0) + 1;
        
//         // New Buyer gets 25 PTS
//         newUser.totalRewardPoints = (newUser.totalRewardPoints || 0) + 500;
//         newUser.isReferralRewardClaimed = true; // Lock the reward so it only happens once

//         await referrer.save();
//         await newUser.save();
        
//         return true;
//     } catch (error) {
//         console.error("Referral Reward Error:", error);
//         return false;
//     }
// }

// export const impersonateUser = async (req, res) => {
//     try {
//         const { userId } = req.body;

//         // 1. Validation
//         const user = await userModel.findById(userId);
//         if (!user) {
//             return res.json({ success: false, message: "Collector record not found in registry." });
//         }

//         // 2. Security Audit (Optional but recommended)
//         console.log(`ADMIN ACTION: Impersonating user ${user.email}`);

//         // 3. Generate a standard User Token
//         // This token will allow the admin to act as the user on the frontend
//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

//         res.json({ 
//             success: true, 
//             token, 
//             user: {
//                 name: user.name,
//                 email: user.email,
//                 totalRewardPoints: user.totalRewardPoints
//             }
//         });
//     } catch (error) {
//         console.error("Impersonation Error:", error);
//         res.json({ success: false, message: "Internal Registry Error" });
//     }
// };


// // --- UPDATED GOOGLE LOGIN ---
// const googleLogin = async (req, res) => {
//     try {
//         const { idToken, referrerCode } = req.body;
//         const ticket = await client.verifyIdToken({
//             idToken,
//             audience: process.env.GOOGLE_CLIENT_ID
//         });

//         const { name, email, picture } = ticket.getPayload();
//         let user = await userModel.findOne({ email });

//         if (!user) {
//             user = await userModel.create({
//                 name, email, image: picture,
//                 password: Date.now() + Math.random().toString(),
//                 totalRewardPoints: 0, referralCount: 0
//             });

//             if (referrerCode) {
//                 await rewardReferrer(referrerCode, user, req.ip || req.headers['x-forwarded-for']);
//             }
//         }
//         const token = createToken(user._id);
//         res.json({ success: true, token });
//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// }

// // --- UPDATED REGISTRATION ---
// const registerUser = async (req, res) => {
//     try {
//         const { name, email, password, referrerCode } = req.body;
//         if (await userModel.findOne({ email })) {
//             return res.json({ success: false, message: "User already exists" });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const newUser = new userModel({
//             name, email, password: hashedPassword,
//             totalRewardPoints: 1000, referralCount: 0,referredBy: req.body.referrerCode || null, 
//             signupIP: req.ip
//         });

//         const user = await newUser.save();

//         if (referrerCode) {
//             await rewardReferrer(referrerCode, user, req.ip || req.headers['x-forwarded-for']);
//         }

//         const token = createToken(user._id);
//         res.json({ success: true, token });
//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// }

// // --- PASSWORD RECOVERY ---
// const forgotPassword = async (req, res) => {
//     try {
//         const { email } = req.body;
//         const user = await userModel.findOne({ email });

//         if (!user) {
//             return res.json({ success: false, message: "Registry email not found." });
//         }

//         const resetToken = crypto.randomBytes(20).toString('hex');
//         user.resetPasswordToken = resetToken;
//         user.resetPasswordExpires = Date.now() + 3600000; // 1 Hour

//         await user.save();

//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS
//             }
//         });

//         const frontendUrl = process.env.FRONTEND_URL;

//         if (!frontendUrl) {
//             console.error("DEPLOYMENT ERROR: FRONTEND_URL is not set in the production dashboard.");
//             return res.json({ success: false, message: "Registry protocol error. Contact Support." });
//         }

//         const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

//         const mailOptions = {
//             to: user.email,
//             from: 'PhilaBasket Registry <noreply@philabasket.com>',
//             subject: 'Archive Access Recovery Protocol',
//             text: `A recovery protocol was initiated for your account.\n\nPlease click here to reset your credentials:\n${resetUrl}`
//         };

//         await transporter.sendMail(mailOptions);
//         res.json({ success: true, message: "Recovery link dispatched." });

//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// }

// const resetPassword = async (req, res) => {
//     try {
//         const { token, newPassword } = req.body;

//         const user = await userModel.findOne({
//             resetPasswordToken: token,
//             resetPasswordExpires: { $gt: Date.now() }
//         });

//         if (!user) {
//             return res.json({ success: false, message: "Token is invalid or expired." });
//         }

//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(newPassword, salt);
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpires = undefined;

//         await user.save();
//         res.json({ success: true, message: "Credentials updated successfully." });

//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// }

// // --- STANDARD LOGIN ---
// const loginUser = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await userModel.findOne({ email });

//         if (!user) {
//             return res.json({ success: false, message: "User doesn't exist" })
//         }

//         const isMatch = await bcrypt.compare(password, user.password);

//         if (isMatch) {
//             const token = createToken(user._id)
//             res.json({ success: true, token })
//         } else {
//             res.json({ success: false, message: 'Invalid credentials' })
//         }
//     } catch (error) {
//         res.json({ success: false, message: error.message })
//     }
// }

// // --- ADMIN & PROFILE ---
// const adminLogin = async (req, res) => {
//     try {
//         const {email,password} = req.body
//         if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
//             const token = jwt.sign(email+password,process.env.JWT_SECRET);
//             res.json({success:true,token})
//         } else {
//             res.json({success:false,message:"Invalid credentials"})
//         }
//     } catch (error) {
//         res.json({ success: false, message: error.message })
//     }
// }

//  // Function to update user default address
// const updateAddress = async (req, res) => {
//     try {
//         const { userId, address ,name} = req.body;

//         // Find the user and update the defaultAddress field
//         const updatedUser = await userModel.findByIdAndUpdate(
//             userId, 
//             { 
//                 defaultAddress: address,
//                 name: name // Sync name change
//             },
//             { new: true } // returns the updated document
//         );

//         if (!updatedUser) {
//             return res.json({ success: false, message: "User not found" });
//         }

//         res.json({ 
//             success: true, 
//             message: "Address updated in the registry.",
//             address: updatedUser.defaultAddress 
//         });

//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// }

// // controllers/userController.js
// export const getTopPhilatelists = async (req, res) => {
//     try {
//         const results = await orderModel.aggregate([
//             { $match: { payment: true } },
//             {
//                 $group: {
//                     _id: "$userId",
//                     totalSpent: { $sum: "$amount" },
//                     orderCount: { $sum: 1 }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "_id",
//                     foreignField: "_id",
//                     as: "userDetails"
//                 }
//             },
//             { $unwind: "$userDetails" },
//             {
//                 $facet: {
//                     byRevenue: [{ $sort: { totalSpent: -1 } }, { $limit: 100 }],
//                     byFrequency: [{ $sort: { orderCount: -1 } }, { $limit: 100 }]
//                 }
//             }
//         ]);

//         res.json({ 
//             success: true, 
//             topUsers: results[0].byRevenue, 
//             mostFrequent: results[0].byFrequency 
//         });
//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// };


// export const getPhilatelistDetail = async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const user = await userModel.findById(userId).populate('orders');

//         if (!user) return res.json({ success: false, message: "User not found" });

//         // Calculate total spent from the populated orders
//         const totalSpent = user.orders
//             .filter(order => order.payment === true)
//             .reduce((acc, order) => acc + (order.amount || 0), 0);

//         res.json({ 
//             success: true, 
//             user: { 
//                 ...user._doc, 
//                 orders: user.orders, 
//                 totalSpent // Now the frontend will see this!
//             } 
//         });
//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// };
// // Remember to add updateAddress to your exports at the bottom of the file

// const getUserProfile = async (req, res) => {
//     try {
//         const { userId } = req.body; 
//         const user = await userModel.findById(userId).select("-password");
//         if (!user) {
//             return res.json({ success: false, message: "User not found" });
//         }
//         res.json({ success: true, user });
//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// }
// // Function to get all registered users
// const listUsers = async (req, res) => {
//     try {
//         // We select email specifically. 
//         // Ensure your userModel actually uses the field name 'email'
//         const users = await userModel.find({}).select('name email');
        
//         console.log(`Found ${users.length} registrants`); // Check your server terminal
//         res.json({ success: true, users });
//     } catch (error) {
//         console.error(error);
//         res.json({ success: false, message: error.message });
//     }
// }

// // controllers/userController.js

// export const getAllUsersData = async (req, res) => {
//     try {
//         const { page = 1, limit = 10, search = "", sortCoins } = req.query;
//         const skip = (parseInt(page) - 1) * parseInt(limit);

//         // 1. Build search query
//         const query = search ? {
//             $or: [
//                 { name: { $regex: search.trim(), $options: 'i' } },
//                 { email: { $regex: search.trim(), $options: 'i' } },
//                 { referralCode: { $regex: search.trim(), $options: 'i' } } // Added referral code search
//             ]
//         } : {};

//         // 2. Define Sort Logic
//         let sortCriteria = { createdAt: -1 }; // Default: Newest collectors first

//         if (sortCoins === 'desc') {
//             sortCriteria = { totalRewardPoints: -1 }; // Highest coins first
//         } else if (sortCoins === 'asc') {
//             sortCriteria = { totalRewardPoints: 1 };  // Lowest coins first
//         }

//         // 3. Execute Query with Pagination
//         const totalUsers = await userModel.countDocuments(query);
//         const users = await userModel.find(query)
//             .select('-password') 
//             .sort(sortCriteria)
//             .skip(skip)
//             .limit(parseInt(limit));

//         res.json({ 
//             success: true, 
//             users, 
//             totalPages: Math.ceil(totalUsers / parseInt(limit)),
//             currentPage: parseInt(page)
//         });
//     } catch (error) {
//         console.error("Registry Fetch Error:", error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // NEW: Separate API for User Details (Call this only when clicking a user)
// export const getSingleUserDetail = async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const user = await userModel.findById(userId).populate('orders');
//         res.json({ success: true, user });
//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// };

// // Adjust Archive Credits (Reward Points)


// export const adjustRewardPoints = async (req, res) => {
//     try {
//         const { userId, amount, action ,description } = req.body;
//         const numAmount = Number(amount);

//         // 1. Fetch user to get current points and email
//         const user = await userModel.findById(userId);
//         if (!user) return res.json({ success: false, message: "Collector not found" });

//         let finalPoints = user.totalRewardPoints;
//         let pointsChange = 0;

//         // 2. Calculate point difference based on action
//         if (action === 'add') {
//             finalPoints += numAmount;
//             pointsChange = +numAmount;
//         } else if (action === 'subtract') {
//             finalPoints = Math.max(0, finalPoints - numAmount);
//             pointsChange = -numAmount;
//         } else if (action === 'overwrite') {
//             pointsChange = numAmount - finalPoints;
//             finalPoints = numAmount;
//         }

//         // 3. Update User Table
//         user.totalRewardPoints = finalPoints;
//         await user.save();

//         // 4. Create Transaction Record in UserReward (Audit Log)
//         const transaction = new userRewardModel({
//             email: user.email,
//             name: `Registry Adjustment (${action.toUpperCase()})`,
//             description: description || "Manual adjustment by Archive Administrator.",
//             discountValue: 0, // No monetary coupon created
//             discountCode: `ADJ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
//             pointsUsed: pointsChange, // Stored as positive for deductions, negative for additions in your schema
//             status: 'used', // Marked as used so it doesn't appear as an active coupon
//             createdAt: new Date()
//         });

//         await transaction.save();

//         res.json({ 
//             success: true, 
//             message: `Registry updated. Balance: ${finalPoints} PTS`,
//             newBalance: finalPoints
//         });

//     } catch (error) {
//         console.error("Adjustment Error:", error);
//         res.json({ success: false, message: error.message });
//     }
// };


// export const searchUsers = async (req, res) => {
//     try {
//         const { query } = req.query;
//         const users = await userModel.find({
//             $or: [
//                 { name: { $regex: query, $options: 'i' } },
//                 { email: { $regex: query, $options: 'i' } }
//             ]
//         }).limit(5);
//         res.json({ success: true, users });
//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// };


// // controllers/userController.js


// /**
//  * Fetches the complete transactional history of reward points for a specific user.
//  * Used by Admin to audit point adjustments.
//  */
// // controllers/userController.js

// export const getUnifiedHistoryAdmin = async (req, res) => {
//     try {
//         const { email } = req.body;

//         if (!email) {
//             return res.json({ success: false, message: "Collector email required" });
//         }

//         const [transactions, coupons] = await Promise.all([
//             rewardTransactionModel.find({ userEmail: email }).lean(),
//             userRewardModel.find({ email: email }).lean()
//         ]);

//         // 1. Format Coupons
//         const formattedCoupons = coupons.map(c => {
//             const rawAmount = c.pointsUsed || c.require_point || 0;
//             return {
//                 _id: c._id,
//                 type: 'VOUCHER',
//                 title: c.name || `Registry Adjustment`,
//                 description: c.description || `Adjustment Ref: ${c.discountCode}`,
//                 amount: Math.abs(rawAmount), 
//                 status: 'used',
//                 createdAt: c.createdAt,
//                 isNegative: rawAmount < 0 
//             };
//         });

//         // 2. Format Transactions + Fetch actual orderNo from orderModel
//         const formattedTransactions = await Promise.all(transactions.map(async (t) => {
//             const rawAmount = t.rewardAmount || 0;
//             const isRedemption = t.actionType === 'redeem_point' || rawAmount < 0;
            
//             let actualOrderNo = null;

//             // Fetch the sequential orderNo from the Order table if orderId exists
//             if (t.orderId) {
//                 // We find by the ID stored in transaction to get the sequential orderNo
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
//                 status: t.status || 'complete',
//                 // This is now the sequential number (1, 2, 3...) from your Order Schema
//                 orderNo: actualOrderNo, 
//                 orderId: t.orderId // Keep for link purposes
//             };
//         }));

//         const combinedHistory = [...formattedCoupons, ...formattedTransactions].sort((a, b) => {
//             return new Date(b.createdAt) - new Date(a.createdAt);
//         });

//         res.json({ success: true, history: combinedHistory });
//     } catch (error) {
//         console.error(error);
//         res.json({ success: false, message: "Archive connection failed." });
//     }
// };


// export const updateTriviaScore = async (req, res) => {
//     try {
//         const { userId, points } = req.body;

//         if (!userId || points === undefined) {
//             return res.json({ success: false, message: "User ID and points are required" });
//         }

//         const user = await userModel.findById(userId);
//         if (!user) {
//             return res.json({ success: false, message: "User not found" });
//         }

//         user.triviaScore = (user.triviaScore || 0) + points;
//         await user.save();

//         res.json({ success: true, message: "Score updated", newScore: user.triviaScore });
//     } catch (error) {
//         console.error(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // Convert Trivia Score into Reward Points (Admin-only)
// export const convertTriviaScoreToPoints = async (req, res) => {
//     try {
//         const { userId, convertAmount, multiplier = 1 } = req.body;
//         const amount = Number(convertAmount);
//         const rate = Number(multiplier);

//         if (!userId || !convertAmount) {
//             return res.json({ success: false, message: "userId and convertAmount are required" });
//         }
//         if (!amount || amount <= 0) {
//             return res.json({ success: false, message: "convertAmount must be a positive number" });
//         }

//         const user = await userModel.findById(userId);
//         if (!user) {
//             return res.json({ success: false, message: "User not found" });
//         }

//         const availableScore = user.triviaScore || 0;
//         if (amount > availableScore) {
//             return res.json({ success: false, message: "Not enough trivia score to convert" });
//         }

//         const coins = Math.floor(amount * rate);

//         user.triviaScore = availableScore - amount;
//         user.totalRewardPoints = (user.totalRewardPoints || 0) + coins;
//         user.triviaCoins = (user.triviaCoins || 0) + coins;
//         await user.save();

//         // Audit transaction for admin review
//         const conversionDescription = `Converted ${amount} trivia score into ${coins} reward points`;
//         const transaction = new userRewardModel({
//             email: user.email,
//             name: "Trivia Conversion",
//             description: conversionDescription,
//             discountValue: coins,
//             pointsUsed: coins,
//             status: "used"
//         });
//         await transaction.save();

//         res.json({
//             success: true,
//             message: "Trivia score converted to reward points",
//             triviaScore: user.triviaScore,
//             totalRewardPoints: user.totalRewardPoints,
//             triviaCoins: user.triviaCoins
//         });
//     } catch (error) {
//         console.error(error);
//         res.json({ success: false, message: error.message });
//     }
// };


// // Get Leaderboard
// export const getLeaderboard = async (req, res) => {
//     try {
//         const leaderboard = await userModel.find({ triviaScore: { $gt: 0 } })
//             .select('name email triviaScore totalRewardPoints triviaCoins')
//             .sort({ triviaScore: -1 })
//             .limit(10);

//         res.json({ success: true, leaderboard });
//     } catch (error) {
//         console.error(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// export { 
//     googleLogin, 
//     loginUser, 
//     registerUser, 
//     adminLogin, 
//     getUserProfile, 
//     forgotPassword, 
//     resetPassword ,
//     listUsers,updateAddress
// }