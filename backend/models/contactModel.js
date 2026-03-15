import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },      // Mandatory mobile
    inquiryType: { type: String, required: true },// Dropdown value
    subject: { type: String, required: true },    // Text input value
    message: { type: String, required: true },
    date: { type: Number, required: true },
    status: { type: String, default: 'Pending' } 
})

const contactModel = mongoose.models.contact || mongoose.model("contact", contactSchema);

export default contactModel;