// controllers/wishlistController.js

import userModel from "../models/userModel.js";

export const toggleWishlist = async (req, res) => {
    try {
        const { userId, itemId } = req.body;
        
        // 1. Fetch current user to check state
        const user = await userModel.findById(userId);
        const exists = user.wishlistData?.includes(itemId);

        // 2. Use $pull or $addToSet for atomic, faster updates
        const updateAction = exists 
            ? { $pull: { wishlistData: itemId } } 
            : { $addToSet: { wishlistData: itemId } };

        const updatedUser = await userModel.findByIdAndUpdate(
            userId, 
            updateAction, 
            { new: true } 
        );

        res.json({ success: true, wishlist: updatedUser.wishlistData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        res.json({ success: true, wishlist: user.wishlistData || [] });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};