import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import csv from 'csv-parser';
import streamifier from 'streamifier';
import { Readable } from 'stream';

import mediaModel from '../models/mediaModel.js';

// Logic to register an asset in the Media Registry


const uploadMedia = async (req, res) => {
    try {
        const { originalName } = req.body;
        const imageFile = req.file; // This is now a buffer, not a path

        if (!imageFile) {
            return res.json({ success: false, message: "No asset detected in buffer" });
        }

        // Use upload_stream for memory buffers
        const cld_upload_stream = cloudinary.uploader.upload_stream(
            {
                folder: "stamp_registry",
                resource_type: "image",
            },
            async (error, result) => {
                if (error) {
                    console.error("Cloudinary Stream Error:", error);
                    return res.json({ success: false, message: "Cloudinary upload failed" });
                }

                // Save the mapping to your Media Registry
                await mediaModel.findOneAndUpdate(
                    { originalName: originalName },
                    { 
                        imageUrl: result.secure_url, 
                        isAssigned: false 
                    },
                    { upsert: true, new: true }
                );

                res.json({ 
                    success: true, 
                    message: `Asset ${originalName} synchronized with registry.` 
                });
            }
        );

        // Pipe the buffer into the Cloudinary stream
        cld_upload_stream.end(imageFile.buffer);

    } catch (error) {
        console.error("Internal Server Error:", error);
        res.json({ success: false, message: error.message });
    }
};

const listMedia = async (req, res) => {
    try {
        const media = await mediaModel.find({}).sort({ _id: -1 });
        res.json({ success: true, media });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
// Add to your exports



// --- HELPER: Upload Memory Buffer to Cloudinary ---
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "philabasket_products" },
            (error, result) => {
                if (result) resolve(result.secure_url);
                else reject(error);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};


// controllers/productController.js

// controllers/productController.js


 const bulkAddProducts = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: "Please upload a CSV file" });
        }

        const stamps = [];
        const skippedRows = [];
        
        // 1. Fetch data in bulk rather than per-row to reduce DB round-trips
        const [existingStamps, allMedia] = await Promise.all([
            productModel.find({}, 'name'),
            mediaModel.find({}, 'originalName imageUrl')
        ]);

        const existingNames = new Set(existingStamps.map(s => s.name.toLowerCase().trim()));
        
        // Convert Media Registry into a Map for O(1) instant lookup
        const mediaMap = new Map(allMedia.map(m => [m.originalName.trim(), m.imageUrl]));

        const stream = Readable.from(req.file.buffer);

        // 2. Process the stream
        stream.pipe(csv())
            .on('data', (row) => {
                try {
                    // --- VALIDATION ---
                    if (!row.name || !row.price || !row.imageName) {
                        skippedRows.push({ row: row.name || "Unknown", reason: "Missing fields" });
                        return;
                    }

                    const nameTrimmed = row.name.trim();
                    if (existingNames.has(nameTrimmed.toLowerCase())) {
                        skippedRows.push({ row: nameTrimmed, reason: "Duplicate entry" });
                        return;
                    }

                    // --- OPTIMIZED MATCHING ---
                    // Instant lookup from our Map instead of a DB query per row
                    const imageUrl = mediaMap.get(row.imageName.trim());

                    // --- PARSING ---
                    let parsedCategory = [];
                    if (row.category) {
                        const cleaned = row.category.trim();
                        parsedCategory = (cleaned.startsWith('[') && cleaned.endsWith(']')) 
                            ? JSON.parse(cleaned) 
                            : cleaned.split(',').map(c => c.trim());
                    }

                    stamps.push({
                        name: nameTrimmed,
                        description: row.description || "",
                        price: Number(row.price),
                        category: parsedCategory,
                        year: Number(row.year) || 2026,
                        country: row.country?.trim() || "India",
                        condition: row.condition || "Mint",
                        stock: Number(row.stock) || 1,
                        bestseller: String(row.bestseller).toLowerCase() === 'true',
                        image: imageUrl ? [imageUrl] : [], 
                        date: Date.now()
                    });

                    existingNames.add(nameTrimmed.toLowerCase());
                } catch (err) {
                    skippedRows.push({ row: row.name || "Unknown", reason: "Format Error" });
                }
            })
            .on('end', async () => {
                try {
                    if (stamps.length === 0) {
                        return res.json({ success: false, message: "No valid data to upload", errors: skippedRows });
                    }

                    // 3. Use bulkWrite or insertMany with ordered:false for maximum speed
                    await productModel.insertMany(stamps, { ordered: false });

                    // 4. Update Media Registry: Mark images as 'Assigned'
                    const usedImageNames = stamps.map(s => s.imageName); 
                    await mediaModel.updateMany(
                        { originalName: { $in: usedImageNames } },
                        { $set: { isAssigned: true } }
                    );

                    res.json({ 
                        success: true, 
                        message: `Archive Updated: ${stamps.length} stamps registered.`,
                        skippedCount: skippedRows.length 
                    });
                } catch (dbErr) {
                    res.json({ success: false, message: "Database Write Error" });
                }
            });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Protocol Error: " + error.message });
    }
};

// --- FEATURE: Bulk Add Stamps from CSV Buffer ---
const bulkAddStamps = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: "Please upload a CSV file" });
        }

        const stamps = [];
        const skippedRows = [];
        
        // Fetch existing names for duplicate prevention
        const existingStamps = await productModel.find({}, 'name');
        const existingNames = new Set(existingStamps.map(s => s.name.toLowerCase().trim()));

        // Convert Buffer to Stream for serverless compatibility
        const stream = Readable.from(req.file.buffer);

        stream.pipe(csv())
            .on('data', (row) => {
                try {
                    if (!row.name || !row.price || !row.country || !row.year) {
                        skippedRows.push({ row: row.name || "Unknown", reason: "Missing required fields" });
                        return;
                    }

                    const nameTrimmed = row.name.trim();
                    if (existingNames.has(nameTrimmed.toLowerCase())) {
                        skippedRows.push({ row: nameTrimmed, reason: "Duplicate entry" });
                        return;
                    }

                    let parsedCategory = [];
                    if (row.category) {
                        const cleanedCategory = row.category.trim();
                        if (cleanedCategory.startsWith('[') && cleanedCategory.endsWith(']')) {
                            parsedCategory = JSON.parse(cleanedCategory);
                        } else {
                            parsedCategory = cleanedCategory.split(',').map(c => c.trim());
                        }
                    }

                    stamps.push({
                        name: nameTrimmed,
                        description: row.description || "",
                        price: Number(row.price),
                        category: parsedCategory,
                        year: Number(row.year),
                        country: row.country.trim(),
                        condition: row.condition || "Used",
                        stock: Number(row.stock) || 1,
                        bestseller: String(row.bestseller).toLowerCase() === 'true',
                        image: [], 
                        date: Date.now()
                    });

                    existingNames.add(nameTrimmed.toLowerCase());
                } catch (rowError) {
                    skippedRows.push({ row: row.name || "Unknown", reason: "Format error" });
                }
            })
            .on('end', async () => {
                try {
                    if (stamps.length === 0) {
                        return res.json({ success: false, message: "No valid data to upload", errors: skippedRows });
                    }
                    await productModel.insertMany(stamps, { ordered: false });
                    res.json({ 
                        success: true, 
                        message: `Successfully added ${stamps.length} stamps.`,
                        skippedCount: skippedRows.length,
                        skippedDetails: skippedRows.slice(0, 5) 
                    });
                } catch (err) {
                    res.json({ success: false, message: "Database Error: " + err.message });
                }
            });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};

// --- FEATURE: Add Product with Image Buffers ---
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, year, condition, country, stock, bestseller } = req.body;

        const imageFiles = [
            req.files?.image1?.[0], 
            req.files?.image2?.[0], 
            req.files?.image3?.[0], 
            req.files?.image4?.[0]
        ].filter(item => item !== undefined);

        // Upload using memory buffers
        const imagesUrl = await Promise.all(
            imageFiles.map((item) => uploadToCloudinary(item.buffer))
        );

        const productData = {
            name,
            description,
            price: Number(price),
            category: Array.isArray(category) ? category : JSON.parse(category),
            year: Number(year),
            condition,
            country,
            stock: Number(stock),
            bestseller: bestseller === "true",
            image: imagesUrl,
            date: Date.now()
        };

        const product = new productModel(productData);
        await product.save();
        res.json({ success: true, message: "Product Added" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// --- FEATURE: Update Images via Buffer ---
const updateProductImages = async (req, res) => {
    try {
        const { id } = req.body;
        const imageFiles = [
            req.files?.image1?.[0], 
            req.files?.image2?.[0], 
            req.files?.image3?.[0], 
            req.files?.image4?.[0]
        ].filter(item => item !== undefined);

        if (imageFiles.length === 0) return res.json({ success: false, message: "No images provided" });

        const imagesUrl = await Promise.all(
            imageFiles.map((item) => uploadToCloudinary(item.buffer))
        );

        await productModel.findByIdAndUpdate(id, { $set: { image: imagesUrl } });
        res.json({ success: true, message: "Images updated", image: imagesUrl[0] });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Dedicated single image upload for Mailer/Blogs
const uploadSingleImage = async (req, res) => {
    try {
        // Multer.fields() puts files in req.files['fieldName'] as an array
        const imageFile = req.files && req.files.image1 && req.files.image1[0];

        if (!imageFile) {
            return res.json({ success: false, message: "Missing required parameter: image1" });
        }

        // Since you're using memoryStorage (Vercel compatible), you upload the buffer
        const result = await cloudinary.uploader.upload_stream(
            { resource_type: 'image', folder: 'mail_banners',transformation: [
                { width: 1200, height: 400, crop: "fill", gravity: "center" }
            ] },
            (error, result) => {
                if (error) return res.json({ success: false, message: error.message });
                res.json({ success: true, imageUrl: result.secure_url });
            }
        ).end(imageFile.buffer);

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.json({ success: true, products });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const removeProduct = async (req, res) => {
    try {
        const { id } = req.body;
        await productModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Stamp Removed" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const removeBulkProducts = async (req, res) => {
    try {
        const { ids } = req.body;
        await productModel.deleteMany({ _id: { $in: ids } });
        res.json({ success: true, message: `${ids.length} Stamps removed` });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const singleProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.body.productId);
        res.json({ success: true, product });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id, name, country, year, price, category, stock } = req.body;
        const updated = await productModel.findByIdAndUpdate(id, {
            name, country, year: Number(year), price: Number(price), stock: Number(stock), category 
        }, { new: true });

        if (updated.stock <= 5) console.log(`Restock Alert: ${updated.name}`);
        res.json({ success: true, message: "Stamp details updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export { 
    listProducts, addProduct, removeProduct, singleProduct, 
    bulkAddStamps, updateProductImages, updateProduct, removeBulkProducts ,uploadSingleImage,bulkAddProducts,uploadMedia,listMedia
};