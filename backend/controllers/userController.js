import 'dotenv/config'
import validator from "validator";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";
import { OAuth2Client } from 'google-auth-library';

import crypto from 'crypto';
import nodemailer from 'nodemailer';

// --- PHASE 1: REQUEST RECOVERY ---
 const forgotPassword = async (req, res) => {
    try {
        console.log("DEBUG: FRONTEND_URL is:", process.env.FRONTEND_URL);
        const { email } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "Registry email not found." });
        }

        // Generate a random 20-character archival token
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Token valid for 1 hour
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; 

        await user.save();

        // Setup Email Transport (using Nodemailer)
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or your preferred service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const mailOptions = {
            to: user.email,
            from: 'PhilaBasket Registry <noreply@philabasket.com>',
            subject: 'Archive Access Recovery Protocol',
            text: `You are receiving this because a recovery protocol was initiated for your collector account.\n\n
            Please click on the following link to rescind your old credentials:\n
            ${resetUrl}\n\n
            If you did not request this, please ignore this transmission.`
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Recovery link dispatched." });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Find user with valid token that hasn't expired
        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.json({ success: false, message: "Token is invalid or has expired." });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user record and clear tokens
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ success: true, message: "Credentials updated successfully." });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}










const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Helper function to reward the referrer
const rewardReferrer = async (referrerCode) => {
    if (referrerCode) {
        const referrer = await userModel.findOne({ referralCode: referrerCode });
        if (referrer) {
            // Reward: 500 PTS (Matches your 10 PTS = ₹1 logic)
            referrer.totalRewardPoints += 500;
            await referrer.save();
            return true;
        }
    }
    return false;
}

const googleLogin = async (req, res) => {
    try {
        const { idToken, referrerCode } = req.body; // Catch referrerCode from Google Login
        
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { name, email, picture } = ticket.getPayload();
        let user = await userModel.findOne({ email });

        if (!user) {
            user = await userModel.create({
                name,
                email,
                password: Date.now() + Math.random().toString(),
                image: picture
            });

            // Reward the referrer if this is a brand new account
            await rewardReferrer(referrerCode);
        }

        const token = createToken(user._id);
        res.json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = createToken(user._id)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: 'Invalid credentials' })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const registerUser = async (req, res) => {
    try {
        const { name, email, password, referrerCode } = req.body; // Catch referrerCode

        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save();

        // Process the referral reward
        await rewardReferrer(referrerCode);

        const token = createToken(user._id)
        res.json({ success: true, token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
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
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.body; 
        const user = await userModel.findById(userId).select("-password");
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { googleLogin, loginUser, registerUser, adminLogin, getUserProfile,forgotPassword,resetPassword }