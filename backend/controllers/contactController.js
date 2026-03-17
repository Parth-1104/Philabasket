import contactModel from "../models/contactModel.js";

// --- ADD CONTACT INQUIRY ---
// controllers/contactController.js
import { sendEmail } from "../config/email.js"; // Ensure path is correct

const addContact = async (req, res) => {
    try {
        const { name, email, phone, inquiryType, subject, message } = req.body;

        if (!name || !email || !phone || !message) {
            return res.json({ success: false, message: "Missing required registry data" });
        }

        const contactData = {
            name,
            email,
            phone,
            inquiryType: inquiryType || "General",
            subject: subject || "No Subject Provided",
            message,
            date: Date.now()
        };

        const newContact = new contactModel(contactData);
        await newContact.save();

        // ── EMAIL LOGIC FOR ADMIN ──────────────────────────────────────────
        const adminEmail = "admin@philabasket.com";
        const emailSubject = `New Registry Inquiry: ${inquiryType || 'General'} - ${name}`;
        
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #BC002D; border-bottom: 2px solid #BC002D; padding-bottom: 10px;">New Philatelic Inquiry</h2>
                <p><strong>Collector Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Inquiry Type:</strong> ${inquiryType || 'General'}</p>
                <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px;">
                    <p style="margin: 0;"><strong>Message:</strong></p>
                    <p style="color: #444; line-height: 1.6;">${message}</p>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 11px; color: #999;">Logged in PhilaBasket Registry at ${new Date().toLocaleString()}</p>
            </div>
        `;

        // Send the email using your existing Resend utility
        await sendEmail(adminEmail, emailSubject, htmlContent);

        res.json({ success: true, message: "Message logged and Admin notified" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

// --- GET ALL MESSAGES (For Admin Side) ---
const listContactMessages = async (req, res) => {
    try {
        // Fetching all messages and sorting by date (newest first)
        const messages = await contactModel.find({}).sort({ date: -1 });
        res.json({ success: true, messages });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// --- DELETE MESSAGE (For Admin Side) ---
const deleteContactMessage = async (req, res) => {
    try {
        // req.body.id should be the MongoDB _id of the message
        await contactModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Inquiry removed from registry" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addContact, listContactMessages, deleteContactMessage };