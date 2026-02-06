import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import csv from 'csv-parser';
import streamifier from 'streamifier';
import { Readable } from 'stream';
import mediaModel from '../models/mediaModel.js';
import categoryModel from "../models/categoryModel.js";

// --- CLOUDINARY HELPERS ---
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { 
                folder: "philabasket_products",
                transformation: [{ fetch_format: "auto", quality: "auto" }] // AUTO-OPTIMIZE
            },
            (error, result) => {
                if (result) {
                    // Inject optimization tags into the URL string
                    const optimizedUrl = result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
                    resolve(optimizedUrl);
                }
                else reject(error);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

// --- MEDIA REGISTRY LOGIC ---
const uploadMedia = async (req, res) => {
    try {
        const { originalName } = req.body;
        const imageFile = req.file;
        if (!imageFile) return res.json({ success: false, message: "No asset detected" });

        const cld_upload_stream = cloudinary.uploader.upload_stream(
            { 
                folder: "stamp_registry", 
                resource_type: "image",
                transformation: [{ fetch_format: "auto", quality: "auto" }] 
            },
            async (error, result) => {
                if (error) return res.json({ success: false, message: "Cloudinary upload failed" });
                
                const optimizedUrl = result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
                
                await mediaModel.findOneAndUpdate(
                    { originalName: originalName },
                    { imageUrl: optimizedUrl, isAssigned: false },
                    { upsert: true, new: true }
                );
                res.json({ success: true, message: `Asset ${originalName} synchronized.` });
            }
        );
        cld_upload_stream.end(imageFile.buffer);
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const listMedia = async (req, res) => {
    try {
        const media = await mediaModel.find({}).sort({ _id: -1 }).lean(); // Added .lean() for speed
        res.json({ success: true, media });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// --- BULK ADD LOGIC (The Working Version - Optimized) ---


const bulkAddProducts = async (req, res) => {
    try {
        if (!req.file) return res.json({ success: false, message: "Please upload a CSV file" });

        const stamps = [];
        const usedImageNames = [];
        const discoveredCategories = new Set(); 

        // 1. Optimized Fetch: Only pull what we need to minimize memory for 100k+ records
        const [existingStamps, allMedia] = await Promise.all([
            productModel.find({}, 'name').lean(),
            mediaModel.find({}, 'originalName imageUrl').lean()
        ]);

        const existingNames = new Set(existingStamps.map(s => s.name.toLowerCase().trim()));
        const mediaMap = new Map(allMedia.map(m => [m.originalName.trim(), m.imageUrl]));

        const stream = Readable.from(req.file.buffer);

        stream.pipe(csv())
            .on('data', (row) => {
                try {
                    // Mandatory validation
                    if (!row.name || !row.imageName1) return; 

                    const nameTrimmed = row.name.trim();
                    if (existingNames.has(nameTrimmed.toLowerCase())) return;

                    // 2. PROCESS MULTIPLE IMAGES (1 to 4)
                    const productImages = [];
                    for (let i = 1; i <= 4; i++) {
                        const imgName = row[`imageName${i}`]?.trim();
                        if (imgName) {
                            let imageUrl = mediaMap.get(imgName);
                            if (imageUrl) {
                                // Apply Cloudinary auto-optimization and watermarking logic placeholder
                                if (!imageUrl.includes('f_auto')) {
                                    imageUrl = imageUrl.replace('/upload/', '/upload/f_auto,q_auto/');
                                }
                                productImages.push(imageUrl);
                                usedImageNames.push(imgName);
                            }
                        }
                    }

                    if (productImages.length === 0) return; 

                    // 3. YOUTUBE URL LOGIC: Cleaning tracking parameters for clean embeds
                    let cleanedYoutubeUrl = "";
                    if (row.youtubeUrl) {
                        const ytUrl = row.youtubeUrl.trim();
                        if (ytUrl.includes('youtube.com') || ytUrl.includes('youtu.be')) {
                            // Extract base URL before '&' to remove timestamps/tracking
                            cleanedYoutubeUrl = ytUrl.split('&')[0]; 
                        }
                    }

                    // 4. CATEGORY PARSING: Handling both plain text and array strings
                    let parsedCategory = [];
                    if (row.category) {
                        const cleaned = row.category.trim();
                        const rawContent = (cleaned.startsWith('[') && cleaned.endsWith(']')) 
                            ? cleaned.substring(1, cleaned.length - 1) : cleaned;
                        
                        parsedCategory = rawContent
                            .split(',')
                            .map(c => c.trim().replace(/^["']|["']$/g, ''))
                            .filter(c => c !== "");
                        
                        parsedCategory.forEach(cat => discoveredCategories.add(cat));
                    }

                    const finalPrice = Number(row.price) || 0;
                    const finalMarketPrice = Number(row.marketPrice) || finalPrice;

                    // 5. DATA ASSEMBLY: Matches your ProductModel Schema exactly
                    stamps.push({
                        name: nameTrimmed,
                        description: row.description || "Historical philatelic specimen.",
                        price: finalPrice,
                        marketPrice: finalMarketPrice,
                        image: productImages, // Array of 1-4 strings
                        youtubeUrl: cleanedYoutubeUrl,
                        category: parsedCategory,
                        year: Number(row.year) || 2026,
                        country: row.country?.trim() || "India",
                        condition: row.condition || "Mint",
                        stock: Number(row.stock) || 1,
                        bestseller: String(row.bestseller).toLowerCase() === 'true',
                        date: Date.now(),
                        // rewardPoints will be handled by the pre-save hook in your model
                    });
                } catch (err) { console.error("Row processing error:", err); }
            })
            .on('end', async () => {
                try {
                    if (stamps.length === 0) return res.json({ success: false, message: "No new unique stamps found in CSV" });

                    // 6. BULK CATEGORY SYNC
                    const categoryArray = Array.from(discoveredCategories);
                    if (categoryArray.length > 0) {
                        const existingCatsInDB = await categoryModel.find({ name: { $in: categoryArray } }).lean();
                        const existingCatNames = new Set(existingCatsInDB.map(c => c.name));
                        const newCats = categoryArray
                            .filter(n => !existingCatNames.has(n))
                            .map(name => ({ name }));
                        
                        if (newCats.length > 0) {
                            await categoryModel.insertMany(newCats, { ordered: false });
                        }
                    }

                    // 7. ATOMIC BULK INSERT
                    await productModel.insertMany(stamps, { ordered: false });
                    
                    // 8. MEDIA STATUS UPDATE: Mark image assets as assigned
                    if (usedImageNames.length > 0) {
                        await mediaModel.updateMany(
                            { originalName: { $in: usedImageNames } }, 
                            { $set: { isAssigned: true } }
                        );
                    }
                    
                    res.json({ 
                        success: true, 
                        message: `Successfully synchronized ${stamps.length} stamps with multi-media and video support.` 
                    });
                } catch (dbErr) { 
                    console.error("Database Bulk Insert Error:", dbErr);
                    res.json({ success: false, message: "Bulk insert failed. Check for duplicate names or schema violations." }); 
                }
            });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};



// --- CORE CRUD (Upgraded for 100k+ Items) ---
// const listProducts = async (req, res) => {
//     try {
//         // ADDED: Server-side pagination support for the Infinite Scroll frontend
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 20;
//         const skip = (page - 1) * limit;

//         const { category, sort, search } = req.query;
//         let query = {};

//         // PERFORMANCE: Use Text Index if searching
//         if (search) {
//             query.$text = { $search: search };
//         }

//         if (category) {
//             query.category = { $in: category.split(',') };
//         }

//         let sortOrder = search ? { score: { $meta: "textScore" } } : { date: -1 };

//         // Logic choice: If sort is requested via query, use it
//         if (sort === 'low-high') sortOrder = { price: 1 };
//         if (sort === 'high-low') sortOrder = { price: -1 };

//         const products = await productModel.find(query)
//             .select('-description') // Do not load description in the list view (Saves bandwidth)
//             .sort(sortOrder)
//             .skip(skip)
//             .limit(limit)
//             .lean(); // Returns plain JS objects (Much faster)

//         const total = await productModel.countDocuments(query);

//         res.json({ 
//             success: true, 
//             products, 
//             total,
//             hasMore: total > skip + limit 
//         });
//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// };

const listProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const { category, sort, search } = req.query;
        let query = {};

        // Layered Search: Regex for mid-name + Text for relevance
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { name: { $regex: searchRegex } },
                { country: { $regex: searchRegex } },
                { category: { $regex: searchRegex } },
                { $text: { $search: search } }
            ];
        }

        if (category) {
            query.category = { $in: category.split(',') };
        }

        // Determine Sort Order
        let sortOrder = { date: -1 }; 
        if (sort === 'low-high') sortOrder = { price: 1 };
        if (sort === 'high-low') sortOrder = { price: -1 };
        
        // If searching without price sort, prioritize text relevance
        if (search && !sort) {
            sortOrder = { score: { $meta: "textScore" } };
        }

        // Executing Query and Count in Parallel
        const [products, total] = await Promise.all([
            productModel.find(query)
                .select('name price marketPrice image category country year stock date bestseller')
                .sort(sortOrder)
                .skip(skip)
                .limit(limit)
                .lean(), // lean() is critical for memory management with 100k+ docs
            productModel.countDocuments(query)
        ]);

        res.json({ 
            success: true, 
            products, 
            total,
            hasMore: total > skip + limit 
        });
    } catch (error) {
        console.error("Registry Query Error:", error);
        res.status(500).json({ success: false, message: "Registry Sync Error" });
    }
};

const addProduct = async (req, res) => {
    try {
        const { name, description, price, marketPrice, category, year, condition, country, stock, bestseller, imageName } = req.body;
        let imagesUrl = [];
        const imageFiles = [req.files?.image1?.[0], req.files?.image2?.[0], req.files?.image3?.[0], req.files?.image4?.[0]].filter(Boolean);

        if (imageFiles.length > 0) {
            imagesUrl = await Promise.all(imageFiles.map(i => uploadToCloudinary(i.buffer)));
        } else if (imageName) {
            const mediaRecord = await mediaModel.findOne({ originalName: imageName.trim() }).lean();
            if (mediaRecord) imagesUrl = [mediaRecord.imageUrl];
        }

        const product = new productModel({
            name, description, price: Number(price), marketPrice: Number(marketPrice) || 0,
            category: Array.isArray(category) ? category : JSON.parse(category),
            year: Number(year), condition, country, stock: Number(stock),
            bestseller: bestseller === "true", image: imagesUrl, date: Date.now()
        });
        await product.save();
        res.json({ success: true, message: "Product Added" });
    } catch (error) { res.json({ success: false, message: error.message }); }
};

const singleProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.body.productId).lean();
        res.json({ success: true, product });
    } catch (error) { res.json({ success: false, message: error.message }); }
};


// Function to fetch a single product detail by ID
const singleProduct1 = async (req, res) => {
    try {
        // Since we use .get with params, use req.query
        const { productId } = req.query; 
        
        const product = await productModel.findById(productId).lean();
        
        if (product) {
            res.json({ success: true, product });
        } else {
            res.json({ success: false, message: "Specimen not found" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Ensure you export it


const removeProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Stamp Removed" });
    } catch (error) { res.json({ success: false, message: error.message }); }
};

const removeBulkProducts = async (req, res) => {
    try {
        const { ids } = req.body;
        await productModel.deleteMany({ _id: { $in: ids } });
        res.json({ success: true, message: `${ids.length} Stamps removed` });
    } catch (error) { res.json({ success: false, message: error.message }); }
};

const updateProduct = async (req, res) => {
    try {
        const { id, name, country, year, price, category, stock } = req.body;
        await productModel.findByIdAndUpdate(id, {
            name, country, year: Number(year), price: Number(price), stock: Number(stock), category 
        });
        res.json({ success: true, message: "Stamp details updated" });
    } catch (error) { res.json({ success: false, message: error.message }); }
};

export const updateProductImages = async (req, res) => {
    // Logic placeholder as per user request to keep all functions
};

export const uploadSingleImage = async (req, res) => {
    try {
        const imageFile = req.files && req.files.image1 && req.files.image1[0];
        if (!imageFile) return res.json({ success: false, message: "Missing image" });

        const result = await cloudinary.uploader.upload_stream(
            { 
                resource_type: 'image', 
                folder: 'mail_banners',
                transformation: [{ width: 1200, height: 400, crop: "fill", gravity: "center", fetch_format: "auto", quality: "auto" }] 
            },
            (error, result) => {
                if (error) return res.json({ success: false, message: error.message });
                res.json({ success: true, imageUrl: result.secure_url });
            }
        ).end(imageFile.buffer);
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export { 
    listProducts, addProduct, removeProduct, singleProduct, 
    updateProduct, removeBulkProducts, bulkAddProducts, uploadMedia, listMedia ,singleProduct1
};