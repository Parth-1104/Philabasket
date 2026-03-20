import mediaModel from "../models/mediaModel.js";
import productModel from "../models/productModel.js";

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


// @desc    Sync orphaned media to products based on #XYZ- pattern
// @route   POST /api/product/sync-media
// @access  Private/Admin
const syncMediaToProducts = async (req, res) => {
    const DEFAULT_IMAGE = "https://res.cloudinary.com/darmvywhd/image/upload/v1773777548/Logo-5_asqxkr.png";

    try {
        const orphanedMedia = await mediaModel.find({ isAssigned: false });
        
        if (orphanedMedia.length === 0) {
            return res.json({ success: true, message: "Registry already synced.", matchCount: 0 });
        }

        let matchCount = 0;
        let syncLog = [];

        for (const asset of orphanedMedia) {
            // 1. IMPROVED REGEX: Captures everything from '#' until a SPACE or a DOUBLE HYPHEN '--'
            // This ensures '#MS180(S)' is captured fully, and doesn't stop at 'MS180'
            const fileMatch = asset.originalName.match(/#([^\s-]+(?:\([^)]+\))?)/i);
        
            if (fileMatch && fileMatch[1]) {
                const productCode = fileMatch[1].trim();
        
                // 2. ESCAPED SEARCH: Since codes like MS180(S) contain special characters '(', ')', 
                // we must escape them before putting them into a MongoDB Regex.
                const escapedCode = productCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                const product = await productModel.findOne({
                    // Ensures #MS180(S) matches #MS180(S)-Title but NOT #MS180-Title
                    name: { $regex: `^#${escapedCode}(\\s|\\-|$)`, $options: 'i' }
                });
        
                if (product) {
                    // STEP 1: CLEANUP placeholders
                    await productModel.findByIdAndUpdate(product._id, {
                        $pull: { image: { $in: [DEFAULT_IMAGE, asset.imageUrl] } }
                    });
        
                    // STEP 2: PREPEND new image
                    await productModel.findByIdAndUpdate(product._id, {
                        $push: { 
                            image: { 
                                $each: [asset.imageUrl], 
                                $position: 0 
                            } 
                        }
                    });
        
                    await mediaModel.findByIdAndUpdate(asset._id, { isAssigned: true });
                    syncLog.push({ filename: asset.originalName, productName: product.name, code: productCode });
                    matchCount++;
                }
            }
        }

        res.json({ success: true, message: "Sync Protocol Complete (Variants Distinguished)", matchCount, syncLog });

    } catch (error) {
        console.error("Sync Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { syncMediaToProducts, getAllMedia };

