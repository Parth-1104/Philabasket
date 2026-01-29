// controllers/wishlistController.js

import userModel from "../models/userModel.js";

export const toggleWishlist = async (req, res) => {
    try {
        const { userId, itemId } = req.body;
        const user = await userModel.findById(userId);
        let wishlist = user.wishlistData || [];

        if (wishlist.includes(itemId)) {
            wishlist = wishlist.filter(id => id !== itemId);
        } else {
            wishlist.push(itemId);
        }

        await userModel.findByIdAndUpdate(userId, { wishlistData: wishlist });
        res.json({ success: true, message: "Wishlist Updated", wishlist });
    } catch (error) {
        res.json({ success: false, message: error.message });
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