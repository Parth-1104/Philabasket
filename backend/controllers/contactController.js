import contactModel from "../models/contactModel.js";

// Add to your routes/contactRoute.js
const addContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Basic validation
        if (!name || !email || !message) {
            return res.json({ success: false, message: "Please fill all required fields" });
        }

        const contactData = {
            name,
            email,
            subject: subject || "General Inquiry", // Default if subject is empty
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
        await contactModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Inquiry removed from registry" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addContact, listContactMessages, deleteContactMessage };