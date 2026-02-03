import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import csv from 'csv-parser';
import streamifier from 'streamifier';
import { Readable } from 'stream';

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
    bulkAddStamps, updateProductImages, updateProduct, removeBulkProducts ,uploadSingleImage
};