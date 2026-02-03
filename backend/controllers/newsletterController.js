import subscriberModel from "../models/subscriberModel.js";
import validator from "validator";

// Subscribe to Newsletter
const subscribeToNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        // Validation
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please provide a valid registry email" });
        }

        // Check if already exists
        const exists = await subscriberModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "This email is already in the Inner Circle" });
        }

        const newSubscriber = new subscriberModel({
            email,
            date: Date.now()
        });

        await newSubscriber.save();
        res.json({ success: true, message: "Welcome to the Inner Circle" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Get All Subscribers (For Admin Dashboard)
const getSubscribers = async (req, res) => {
    try {
        const subscribers = await subscriberModel.find({}).sort({ date: -1 });
        res.json({ success: true, subscribers });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { subscribeToNewsletter, getSubscribers };