import mediaModel from "../models/mediaModel.js";

const getAllMedia = async (req, res) => {
    try {
        // Fetching all media assets sorted by newest first
        const media = await mediaModel.find({}).sort({ _id: -1 });

        res.json({ 
            success: true, 
            media,
            message: "Media Registry Synchronized" 
        });
    } catch (error) {
        console.error("Media Fetch Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Archive Error" 
        });
    }
};

export { getAllMedia };