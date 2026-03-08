import feedbackModel from "../models/feedbackModel.js";
import userModel from "../models/userModel.js";
import nodemailer from 'nodemailer';

import { v2 as cloudinary } from "cloudinary";

// Add Feedback
// File: controllers/feedbackController.js

// Inside feedbackController.js -> addFeedback function
// controllers/feedbackController.js
// controllers/feedbackController.js



import streamifier from 'streamifier';

import dotenv from 'dotenv';

dotenv.config()


const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS  // Your 16-digit App Password (NOT your login pass)
    },

});

const addFeedback = async (req, res) => {
    try {
        const { 
            orderId, orderNo, text, rating, userId,
            packingrating, shippingrating, qualityrating, 
            raterating, processrating 
        } = req.body;

        const existingFeedback = await feedbackModel.findOne({ orderId });
        if (existingFeedback) {
            return res.json({ success: false, message: "Feedback already exists for this order." });
        }

        let imageUrl = "";
        const uploadToCloudinary = (buffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "feedback_specimens" },
                    (error, result) => {
                        if (result) resolve(result.secure_url);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(buffer).pipe(stream);
            });
        };

        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.buffer);
        }

        const user = await userModel.findById(userId);
        
        // --- ARCHIVE SYNCHRONIZATION ---
        const feedbackData = new feedbackModel({
            userId,
            userName: user?.name || "Anonymous Collector",
            orderId,
            orderNo,
            
            // 1. DUAL-FIELD STORAGE
            // 'text' can be edited by admin later
            // 'originalText' is the immutable archive record
            text: text || "",
            originalText: text || "", 

            image: imageUrl,

            // 2. RATING LOCK
            // 'rating' is the active display grade
            // 'originalRating' preserves the collector's initial appraisal
            rating: Number(rating) || 5,
            originalRating: Number(rating) || 5,

            packingrating: Number(packingrating) || 5,
            shippingrating: Number(shippingrating) || 5,
            qualityrating: Number(qualityrating) || 5,
            raterating: Number(raterating) || 5,
            processrating: Number(processrating) || 5,
            date: Date.now()
        });

        await feedbackData.save();

        const mailOptions = {
            from: `"Registry Archives" <${process.env.EMAIL_USER}>`,
            to: 'Admin@philabasket.com',
            subject: `[RAW MANUSCRIPT] Order #${orderNo} - ${user?.name}`,
            html: `
                <div style="font-family: 'Helvetica', sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px;">
                    <div style="background: #BC002D; padding: 10px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #ffffff; font-size: 16px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Original Appraisal</h2>
                    </div>
                    <p style="font-size: 13px; margin: 5px 0;"><strong>Registry Reference:</strong> #${orderNo}</p>
                    <p style="font-size: 13px; margin: 5px 0;"><strong>Collector:</strong> ${user?.name}</p>
                    
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #BC002D; font-style: italic; margin: 20px 0; color: #1e293b; font-size: 14px; line-height: 1.6;">
                        "${text || 'No remarks provided.'}"
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px; color: #64748b; border-top: 1px solid #f1f5f9; pt-15;">
                        <p><b>Quality:</b> ${qualityrating}/5</p>
                        <p><b>Packing:</b> ${packingrating}/5</p>
                        <p><b>Logistics:</b> ${shippingrating}/5</p>
                        <p><b>Original Grade:</b> ${rating}/5</p>
                    </div>

                    ${imageUrl ? `
                        <div style="margin-top: 20px; text-align: center;">
                            <a href="${imageUrl}" style="display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 5px; font-size: 10px; font-weight: bold; text-transform: uppercase;">View Specimen Photo</a>
                        </div>
                    ` : ''}
                </div>
            `
        };

        // Fire background process so response isn't delayed
        transporter.sendMail(mailOptions).catch(err => console.error("Gmail Protocol Failed:", err));

        res.json({ success: true, message: "Feedback archived with original content lock" });

    } catch (error) {
        console.error("Archive Sync Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// Admin: Feature feedback for home page
const toggleFeaturedFeedback = async (req, res) => {
    try {
        const { feedbackId, status } = req.body;
        await feedbackModel.findByIdAndUpdate(feedbackId, { isFeatured: status });
        res.json({ success: true, message: "Registry visibility updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// List Featured Feedback (For Home Page)
const getFeaturedFeedback = async (req, res) => {
    try {
        const testimonials = await feedbackModel.find({ isFeatured: true });
        res.json({ success: true, testimonials });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const listAllFeedback = async (req, res) => {
    try {
        const feedback = await feedbackModel.find({});
        res.json({ success: true, feedback });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const getUserFeedbacks = async (req, res) => {
    try {
        const { userId } = req.body; // Injected by your authUser middleware
        
        // We only need the orderId to handle the frontend button state
        const feedbacks = await feedbackModel.find({ userId }).select('orderId');
        
        res.json({ 
            success: true, 
            feedbacks: feedbacks.map(f => f.orderId) // Return an array of IDs
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const updateFeedback = async (req, res) => {
    try {
        // feedbackId identifies the document, the rest are fields to update
        const { feedbackId, text, rating, isFeatured } = req.body;

        const updatedFeedback = await feedbackModel.findByIdAndUpdate(
            feedbackId,
            { 
                text: text || "", 
                rating: Number(rating) || 5, 
                isFeatured: isFeatured // Toggle visibility for home page
            },
            { new: true, runValidators: true } // Returns the updated document
        );

        if (!updatedFeedback) {
            return res.json({ success: false, message: "Feedback record not found in registry." });
        }

        res.json({ 
            success: true, 
            message: "Consignment feedback modified successfully", 
            data: updatedFeedback 
        });
    } catch (error) {
        console.error("Admin Update Error:", error);
        res.json({ success: false, message: error.message });
    }
};

export { addFeedback, toggleFeaturedFeedback, getFeaturedFeedback ,listAllFeedback,getUserFeedbacks,updateFeedback};