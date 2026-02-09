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
                
                // ADDED: Capture result.public_id
                await mediaModel.findOneAndUpdate(
                    { originalName: originalName },
                    { 
                        imageUrl: optimizedUrl, 
                        public_id: result.public_id, // Store this for deletion
                        isAssigned: false 
                    },
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


// import { Readable } from 'stream';
// import csv from 'csv-parser';
// import productModel from '../models/productModel.js';
// import mediaModel from '../models/mediaModel.js';
// import categoryModel from '../models/categoryModel.js';

// import { Readable } from 'stream';
// import csv from 'csv-parser';
// import productModel from '../models/productModel.js';
// import mediaModel from '../models/mediaModel.js';
// import categoryModel from '../models/categoryModel.js';


const bulkAddProducts = async (req, res) => {
    try {
        if (!req.file) return res.json({ success: false, message: "Please upload a CSV file" });

        const stamps = [];
        const usedImageNames = [];
        const discoveredCategories = new Set(); 
        let rowsProcessed = 0;
        let skippedEmpty = 0;
        let skippedDuplicate = 0;
        let skippedNoImage = 0;

        // 1. Pre-fetch registry state
        const [existingStamps, allMedia] = await Promise.all([
            productModel.find({}, 'name').lean(),
            mediaModel.find({}, 'originalName imageUrl').lean()
        ]);

        const existingNames = new Set(existingStamps.map(s => s.name.toLowerCase().trim()));
        
        const extractBkId = (name) => {
            if (!name) return null;
            const match = String(name).match(/#?BK\d+/i);
            return match ? match[0].toUpperCase().replace('#', '') : null;
        };

        const stream = Readable.from(req.file.buffer);

        stream.pipe(csv({
            mapHeaders: ({ header }) => header.trim().replace(/^["']|["']$/g, ''), 
            skipLines: 0,
            strict: false // Prevents the parser from crashing on mismatched column counts
        }))
        .on('data', (row) => {
            rowsProcessed++;
            try {
                // --- ROBUST SANITIZATION ---
                // Helper to clean any field of quotes, brackets, and extra whitespace
                const clean = (val) => val ? String(val).trim().replace(/^["'\[]|["'\]]$/g, '').trim() : "";

                const rawName = row.name || row['"name"'] || Object.values(row)[0]; 
                const nameTrimmed = clean(rawName);

                // Skip Logic with tracking
                if (!nameTrimmed) { skippedEmpty++; return; }
                if (existingNames.has(nameTrimmed.toLowerCase())) { skippedDuplicate++; return; }

                // --- SMART IMAGE SYNC ---
                const productImages = [];
                for (let i = 1; i <= 4; i++) {
                    const csvImgInput = clean(row[`imageName${i}`] || row[`"imageName${i}"`]);
                    if (csvImgInput) {
                        const searchId = extractBkId(csvImgInput);
                        if (searchId) {
                            const foundEntry = allMedia.find(m => extractBkId(m.originalName) === searchId);
                            if (foundEntry) {
                                let imageUrl = foundEntry.imageUrl;
                                if (imageUrl.includes('cloudinary.com') && !imageUrl.includes('f_auto')) {
                                    imageUrl = imageUrl.replace('/upload/', '/upload/f_auto,q_auto/');
                                }
                                productImages.push(imageUrl);
                                usedImageNames.push(foundEntry.originalName); 
                            }
                        }
                    }
                }

                // If no image match, we skip but track it
                if (productImages.length === 0) { skippedNoImage++; return; }

                // --- CATEGORY PARSING ---
                let parsedCategory = [];
                const rawCat = clean(row.category || row['"category"']);
                if (rawCat) {
                    parsedCategory = rawCat
                        .split(',')
                        .map(c => c.trim().replace(/^["']|["']$/g, ''))
                        .filter(c => c !== "");
                }

                // --- BUILD FINAL OBJECT ---

                
                // --- BUILD FINAL OBJECT ---
                
                // 1. Clean and convert marketPrice
                const rawMarketPrice = Number(String(row.marketPrice || 0).replace(/[^0-9.]/g, '')) || 0;
                
                // 2. Clean and convert price
                const rawPrice = Number(String(row.price || 0).replace(/[^0-9.]/g, '')) || 0;
                
                // 3. APPLY HIERARCHY: If rawPrice is 0 or empty, use marketPrice
                const sellingPrice = rawPrice > 0 ? rawPrice : rawMarketPrice;

                stamps.push({
                    name: nameTrimmed,
                    description: clean(row.description) || "Historical philatelic specimen.",
                    marketPrice: rawMarketPrice,
                    price: sellingPrice, // This is your conditional fallback
                    image: productImages,
                    youtubeUrl: clean(row.youtubeUrl).split('&')[0],
                    category: parsedCategory,
                    year: Number(row.year) || 0,
                    country: clean(row.country) || "India",
                    condition: clean(row.condition) || "Mint",
                    stock: Number(row.stock) || 1,
                    bestseller: String(row.bestseller).toLowerCase().includes('true'),
                    isActive: true,
                    date: Date.now()
                });

                // Only sync categories for items that actually got added
                parsedCategory.forEach(cat => discoveredCategories.add(cat));

            } catch (err) {
                // If a single row fails, we log it but THE STREAM CONTINUES
                console.error(`Error processing row ${rowsProcessed}:`, err);
            }
        })
        .on('end', async () => {
            try {
                if (stamps.length === 0) {
                    return res.json({ 
                        success: false, 
                        message: `Zero items synced. Processed: ${rowsProcessed}, Duplicates: ${skippedDuplicate}, No Image Match: ${skippedNoImage}` 
                    });
                }

                // Atomic Category Sync
                const categoryArray = Array.from(discoveredCategories);
                if (categoryArray.length > 0) {
                    const existingCatsInDB = await categoryModel.find({ name: { $in: categoryArray } }).lean();
                    const existingCatNames = new Set(existingCatsInDB.map(c => c.name));
                    const newCats = categoryArray
                        .filter(n => !existingCatNames.has(n))
                        .map(name => ({ name, group: "Independent" }));
                    
                    if (newCats.length > 0) {
                        await categoryModel.insertMany(newCats, { ordered: false });
                    }
                }

                // Bulk Insert Products
                await productModel.insertMany(stamps, { ordered: false });
                
                // Flag Media as assigned
                if (usedImageNames.length > 0) {
                    await mediaModel.updateMany(
                        { originalName: { $in: usedImageNames } }, 
                        { $set: { isAssigned: true } }
                    );
                }
                
                res.json({ 
                    success: true, 
                    message: `Sync Complete. Items in CSV: ${rowsProcessed} | Successfully Added: ${stamps.length} | Skipped (Duplicate): ${skippedDuplicate} | Skipped (No Image Match): ${skippedNoImage}` 
                });
            } catch (dbErr) {
                console.error("Final Database Operation Error:", dbErr);
                res.json({ success: false, message: "Registry update failed at final step." });
            }
        });
    } catch (error) {
        console.error("Fatal Controller Error:", error);
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

// --- UPDATED listProducts CONTROLLER ---

// import categoryModel from '../models/categoryModel.js'; // Ensure this is imported

const listProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const { category, group, sort, search, includeHidden } = req.query;
        
        // --- 1. BASE QUERY ---
        let query = {};

        // Force isActive: true for public storefront
        if (includeHidden !== 'true') {
            query.isActive = true;
        }

        // --- 2. LAYERED FILTERS ---
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { name: { $regex: searchRegex } },
                    { country: { $regex: searchRegex } },
                    { category: { $regex: searchRegex } }
                ]
            });
        }

        // --- NEW: PARENT GROUP FILTERING ---
        if (group) {
            // Find all sub-categories belonging to this Parent Group
            const categoriesInGroup = await categoryModel.find({ group: group }).lean();
            const categoryNames = categoriesInGroup.map(cat => cat.name);
            
            // Add to query using $in operator
            query.category = { $in: categoryNames };
        }

        // Keep existing individual category filter (overrides group if both provided)
        if (category) {
            query.category = { $in: category.split(',') };
        }

        // --- 3. SORT LOGIC ---
        let sortOrder = { date: -1 }; 
        if (sort === 'low-high') sortOrder = { price: 1 };
        if (sort === 'high-low') sortOrder = { price: -1 };

        // --- 4. EXECUTION ---
        const [products, total] = await Promise.all([
            productModel.find(query)
                .select('name price marketPrice image category country year stock date bestseller description youtubeUrl isActive isLatest')
                .sort(sortOrder)
                .skip(skip)
                .limit(limit)
                .lean(), 
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
// Bulk toggle visibility (isActive)
export const bulkUpdateStatus = async (req, res) => {
    try {
        const { ids, isActive } = req.body;
        await productModel.updateMany(
            { _id: { $in: ids } },
            { $set: { isActive: isActive } }
        );
        res.json({ 
            success: true, 
            message: `${ids.length} Specimens updated to ${isActive ? 'Active' : 'Hidden'}` 
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

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

// controllers/productController.js

const updateProduct = async (req, res) => {
    try {
        // Destructure the ID and collect all other fields into 'rest'
        const { id, ...updateData } = req.body;

        // 1. Data Sanitization: Ensure booleans are actually booleans
        // (Sometimes forms send them as strings "true"/"false")
        if (updateData.isLatest !== undefined) {
            updateData.isLatest = updateData.isLatest === true || updateData.isLatest === 'true';
        }
        if (updateData.isActive !== undefined) {
            updateData.isActive = updateData.isActive === true || updateData.isActive === 'true';
        }
        if (updateData.bestseller !== undefined) {
            updateData.bestseller = updateData.bestseller === true || updateData.bestseller === 'true';
        }

        // 2. Perform the update
        // { new: true } returns the document AFTER the update
        // { runValidators: true } ensures the new data matches your schema rules
        const updatedProduct = await productModel.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.json({ success: false, message: "Specimen not found in registry" });
        }

        res.json({ 
            success: true, 
            message: "Registry Record Synchronized", 
            product: updatedProduct 
        });

    } catch (error) {
        console.error("Update Error:", error);
        res.json({ success: false, message: error.message });
    }
}

export const updateProductImages = async (req, res) => {
    try {
        const { id } = req.body;

        // 1. Fetch the existing product to get current images
        const product = await productModel.findById(id);
        if (!product) {
            return res.json({ success: false, message: "Specimen not found" });
        }

        // 2. Extract files from Multer
        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

        // 3. Upload new images to Cloudinary
        // We use Promise.all to upload all images simultaneously for speed
        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { 
                    resource_type: 'image',
                    folder: 'stamp_registry' // Optional: keeps your Cloudinary organized
                });
                return result.secure_url;
            })
        );

        // 4. Update Strategy: 
        // If the admin uploaded NEW images, we replace the array. 
        // If no files were sent, we keep the old ones.
        const updatedImages = imagesUrl.length > 0 ? imagesUrl : product.image;

        await productModel.findByIdAndUpdate(id, { image: updatedImages });

        res.json({ 
            success: true, 
            message: "Visual Archive Updated", 
            images: updatedImages 
        });

    } catch (error) {
        console.error("Image Update Error:", error);
        res.json({ success: false, message: error.message });
    }
};

const updateMediaName = async (req, res) => {
    try {
        const { id, newName } = req.body;
        
        const updatedMedia = await mediaModel.findByIdAndUpdate(
            id, 
            { originalName: newName }, 
            { new: true }
        );

        if (!updatedMedia) {
            return res.json({ success: false, message: "Asset not found" });
        }

        res.json({ success: true, message: "Filename updated in registry" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const deleteMedia = async (req, res) => {
    try {
        const { ids } = req.body; // Array of MongoDB _ids

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.json({ success: false, message: "No assets selected" });
        }

        // 1. Fetch assets to get Cloudinary public_ids
        const assetsToDelete = await mediaModel.find({ _id: { $in: ids } }).select('public_id');
        
        // Filter out any records that might be missing a public_id
        const publicIds = assetsToDelete
            .map(asset => asset.public_id)
            .filter(id => id != null);

        // 2. Delete from Cloudinary
        if (publicIds.length > 0) {
            // cloudinary.api.delete_resources can handle up to 100 IDs per call
            await cloudinary.api.delete_resources(publicIds);
        }

        // 3. Delete from MongoDB
        const deleteResult = await mediaModel.deleteMany({ _id: { $in: ids } });

        res.json({ 
            success: true, 
            message: `${deleteResult.deletedCount} assets purged from registry and Cloudinary.` 
        });
    } catch (error) {
        console.error("Purge Error:", error);
        res.json({ success: false, message: "Purge failed: " + error.message });
    }
}


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
    updateProduct, removeBulkProducts, bulkAddProducts, uploadMedia, listMedia ,singleProduct1,updateMediaName,deleteMedia
};