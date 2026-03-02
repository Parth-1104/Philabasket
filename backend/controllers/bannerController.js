import bannerModel from "../models/bannerModel.js";

// 1. ADD NEW BANNER
const addBanner = async (req, res) => {
    try {
        const { image, title, link } = req.body;
        const bannerData = new bannerModel({
            image,
            title,
            link: link || "",
            date: Date.now()
        });
        await bannerData.save();
        res.json({ success: true, message: "Banner synchronized to Registry" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 2. LIST ALL BANNERS
const listBanners = async (req, res) => {
    try {
        const banners = await bannerModel.find({}).sort({ date: -1 });
        res.json({ success: true, banners });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 3. UPDATE BANNER (Change Image or Link)
const updateBanner = async (req, res) => {
    try {
        const { id, image, title, link } = req.body;
        await bannerModel.findByIdAndUpdate(id, { image, title, link });
        res.json({ success: true, message: "Visual Architecture Updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 4. REMOVE BANNER
const removeBanner = async (req, res) => {
    try {
        await bannerModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Banner Purged from Registry" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export { addBanner, listBanners, updateBanner, removeBanner };