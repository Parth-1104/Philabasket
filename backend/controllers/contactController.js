import contactModel from "../models/contactModel.js";

// --- ADD CONTACT INQUIRY ---
const addContact = async (req, res) => {
    try {
        // Destructure the new fields: phone and inquiryType
        const { name, email, phone, inquiryType, subject, message } = req.body;

        // Validation: Ensure mandatory fields are present
        if (!name || !email || !phone || !message) {
            return res.json({ success: false, message: "Missing required registry data (Name, Email, Phone, or Message)" });
        }

        const contactData = {
            name,
            email,
            phone,         // New mandatory field
            inquiryType: inquiryType || "General", // The dropdown value
            subject: subject || "No Subject Provided", // The text input value
            message,
            date: Date.now()
        };

        const newContact = new contactModel(contactData);
        await newContact.save();

        res.json({ success: true, message: "Message successfully logged in Registry" });

    } catch (error) {
        console.log(error);
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