import headerModel from "../models/headerModel.js";

// 1. GET HEADER DATA
// Fetches the marquee text and the navigation menu structure
const getHeader = async (req, res) => {
    try {
        // Find the first (and only) header document
        let header = await headerModel.findOne();
        
        // If no header exists (first time setup), create a default one
        if (!header) {
            header = await headerModel.create({
                marqueeText: "• Welcome to the Philatelic Registry • Global Shipping Active •",
                navMenu: []
            });
        }
        
        res.json({ success: true, data: header });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 2. UPDATE HEADER DATA
// Overwrites the marquee and menu with the admin's new configuration
const updateHeader = async (req, res) => {
    try {
        const { marqueeText, navMenu } = req.body;

        // Find and update the document, or create it if it doesn't exist (upsert)
        const updatedHeader = await headerModel.findOneAndUpdate(
            {}, 
            { marqueeText, navMenu }, 
            { new: true, upsert: true }
        );

        res.json({ success: true, message: "Header Protocol Synchronized", data: updatedHeader });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export { getHeader, updateHeader };