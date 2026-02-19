import feedbackModel from "../models/feedbackModel.js";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

// Add Feedback
// File: controllers/feedbackController.js

// Inside feedbackController.js -> addFeedback function
// controllers/feedbackController.js
const addFeedback = async (req, res) => {
    try {
        // req.body now contains orderId, text, and the userId added by authUser
        const { orderId, text, rating, userId } = req.body;

        console.log("Archive Sync - Received User ID:", userId);

        if (!userId) {
            return res.json({ success: false, message: "Authentication failed. ID not found." });
        }

        // Search the User collection
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.json({ success: false, message: "User record not found in database." });
        }

        let imageUrl = "";
        if (req.file) {
            const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
                resource_type: "image",
                folder: "feedback_specimens"
            });
            imageUrl = uploadResponse.secure_url;
        }

        const feedbackData = new feedbackModel({
            userId,
            userName: user.name, // Will correctly pick up "Parth Singh"
            orderId,
            text: text || "",
            image: imageUrl,
            rating: Number(rating) || 5,
            date: Date.now()
        });

        await feedbackData.save();
        res.json({ success: true, message: "Feedback archived successfully" });

    } catch (error) {
        console.error("Feedback Error:", error);
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

export { addFeedback, toggleFeaturedFeedback, getFeaturedFeedback ,listAllFeedback};