// import { v2 as cloudinary } from "cloudinary"
// import productModel from "../models/productModel.js"
// import csv from 'csv-parser';
// import streamifier from 'streamifier';
// import { Readable } from 'stream';
// import mediaModel from '../models/mediaModel.js';
// import categoryModel from "../models/categoryModel.js";

// // --- CLOUDINARY HELPERS ---
// const uploadToCloudinary = (fileBuffer) => {
//     return new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(
//             { folder: "philabasket_products" },
//             (error, result) => {
//                 if (result) resolve(result.secure_url);
//                 else reject(error);
//             }
//         );
//         streamifier.createReadStream(fileBuffer).pipe(stream);
//     });
// };

// // --- MEDIA REGISTRY LOGIC ---
// const uploadMedia = async (req, res) => {
//     try {
//         const { originalName } = req.body;
//         const imageFile = req.file;
//         if (!imageFile) return res.json({ success: false, message: "No asset detected" });

//         const cld_upload_stream = cloudinary.uploader.upload_stream(
//             { folder: "stamp_registry", resource_type: "image" },
//             async (error, result) => {
//                 if (error) return res.json({ success: false, message: "Cloudinary upload failed" });
//                 await mediaModel.findOneAndUpdate(
//                     { originalName: originalName },
//                     { imageUrl: result.secure_url, isAssigned: false },
//                     { upsert: true, new: true }
//                 );
//                 res.json({ success: true, message: `Asset ${originalName} synchronized.` });
//             }
//         );
//         cld_upload_stream.end(imageFile.buffer);
//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// };

// const listMedia = async (req, res) => {
//     try {
//         const media = await mediaModel.find({}).sort({ _id: -1 });
//         res.json({ success: true, media });
//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// };

// // --- BULK ADD LOGIC (The Working Version) ---
// const bulkAddProducts = async (req, res) => {
//     try {
//         if (!req.file) return res.json({ success: false, message: "Please upload a CSV file" });

//         const stamps = [];
//         const usedImageNames = [];
//         const discoveredCategories = new Set(); 

//         const [existingStamps, allMedia] = await Promise.all([
//             productModel.find({}, 'name'),
//             mediaModel.find({}, 'originalName imageUrl')
//         ]);

//         const existingNames = new Set(existingStamps.map(s => s.name.toLowerCase().trim()));
//         const mediaMap = new Map(allMedia.map(m => [m.originalName.trim(), m.imageUrl]));

//         const stream = Readable.from(req.file.buffer);

//         stream.pipe(csv())
//             .on('data', (row) => {
//                 try {
//                     const csvImageName = row.imageName?.trim();
//                     if (!row.name || !row.price || !csvImageName) return;

//                     const nameTrimmed = row.name.trim();
//                     if (existingNames.has(nameTrimmed.toLowerCase())) return;

//                     const imageUrl = mediaMap.get(csvImageName);
//                     if (!imageUrl) return;

//                     let parsedCategory = [];
//                     if (row.category) {
//                         const cleaned = row.category.trim();
//                         const rawContent = (cleaned.startsWith('[') && cleaned.endsWith(']')) 
//                             ? cleaned.substring(1, cleaned.length - 1) : cleaned;
//                         parsedCategory = rawContent.split(',').map(c => c.trim().replace(/^["']|["']$/g, '')).filter(c => c !== "");
//                         parsedCategory.forEach(cat => discoveredCategories.add(cat));
//                     }

//                     stamps.push({
//                         name: nameTrimmed,
//                         description: row.description || "",
//                         price: Number(row.price),
//                         marketPrice: Number(row.marketPrice) || 0,
//                         category: parsedCategory,
//                         year: Number(row.year) || 2026,
//                         country: row.country?.trim() || "India",
//                         condition: row.condition || "Mint",
//                         stock: Number(row.stock) || 1,
//                         bestseller: String(row.bestseller).toLowerCase() === 'true',
//                         image: [imageUrl],
//                         date: Date.now()
//                     });
//                     usedImageNames.push(csvImageName);
//                 } catch (err) { console.error("Row Error", err); }
//             })
//             .on('end', async () => {
//                 try {
//                     if (stamps.length === 0) return res.json({ success: false, message: "No new data to sync" });

//                     const categoryArray = Array.from(discoveredCategories);
//                     if (categoryArray.length > 0) {
//                         const existingCatsInDB = await categoryModel.find({ name: { $in: categoryArray } });
//                         const existingCatNames = new Set(existingCatsInDB.map(c => c.name));
//                         const newCats = categoryArray.filter(n => !existingCatNames.has(n)).map(name => ({ name }));
//                         if (newCats.length > 0) await categoryModel.insertMany(newCats, { ordered: false });
//                     }

//                     await productModel.insertMany(stamps, { ordered: false });
//                     await mediaModel.updateMany({ originalName: { $in: usedImageNames } }, { $set: { isAssigned: true } });
//                     res.json({ success: true, message: `Successfully synchronized ${stamps.length} stamps.` });
//                 } catch (dbErr) { res.json({ success: false, message: dbErr.message }); }
//             });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // --- CORE CRUD ---
// const listProducts = async (req, res) => {
//     try {
//         const products = await productModel.find({});
//         res.json({ success: true, products });
//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// };

// const addProduct = async (req, res) => {
//     try {
//         const { name, description, price, marketPrice, category, year, condition, country, stock, bestseller, imageName } = req.body;
//         let imagesUrl = [];
//         const imageFiles = [req.files?.image1?.[0], req.files?.image2?.[0], req.files?.image3?.[0], req.files?.image4?.[0]].filter(Boolean);

//         if (imageFiles.length > 0) {
//             imagesUrl = await Promise.all(imageFiles.map(i => uploadToCloudinary(i.buffer)));
//         } else if (imageName) {
//             const mediaRecord = await mediaModel.findOne({ originalName: imageName.trim() });
//             if (mediaRecord) imagesUrl = [mediaRecord.imageUrl];
//         }

//         const product = new productModel({
//             name, description, price: Number(price), marketPrice: Number(marketPrice) || 0,
//             category: Array.isArray(category) ? category : JSON.parse(category),
//             year: Number(year), condition, country, stock: Number(stock),
//             bestseller: bestseller === "true", image: imagesUrl, date: Date.now()
//         });
//         await product.save();
//         res.json({ success: true, message: "Product Added" });
//     } catch (error) { res.json({ success: false, message: error.message }); }
// };

// const singleProduct = async (req, res) => {
//     try {
//         const product = await productModel.findById(req.body.productId);
//         res.json({ success: true, product });
//     } catch (error) { res.json({ success: false, message: error.message }); }
// };

// const removeProduct = async (req, res) => {
//     try {
//         await productModel.findByIdAndDelete(req.body.id);
//         res.json({ success: true, message: "Stamp Removed" });
//     } catch (error) { res.json({ success: false, message: error.message }); }
// };

// const removeBulkProducts = async (req, res) => {
//     try {
//         const { ids } = req.body;
//         await productModel.deleteMany({ _id: { $in: ids } });
//         res.json({ success: true, message: `${ids.length} Stamps removed` });
//     } catch (error) { res.json({ success: false, message: error.message }); }
// };

// const updateProduct = async (req, res) => {
//     try {
//         const { id, name, country, year, price, category, stock } = req.body;
//         await productModel.findByIdAndUpdate(id, {
//             name, country, year: Number(year), price: Number(price), stock: Number(stock), category 
//         });
//         res.json({ success: true, message: "Stamp details updated" });
//     } catch (error) { res.json({ success: false, message: error.message }); }
// };
// export const updateProductImages = async (req, res) => {
// };

// export const uploadSingleImage = async (req, res) => {
//     try {
//         // Multer.fields() puts files in req.files['fieldName'] as an array
//         const imageFile = req.files && req.files.image1 && req.files.image1[0];

//         if (!imageFile) {
//             return res.json({ success: false, message: "Missing required parameter: image1" });
//         }

//         // Since you're using memoryStorage (Vercel compatible), you upload the buffer
//         const result = await cloudinary.uploader.upload_stream(
//             { resource_type: 'image', folder: 'mail_banners',transformation: [
//                 { width: 1200, height: 400, crop: "fill", gravity: "center" }
//             ] },
//             (error, result) => {
//                 if (error) return res.json({ success: false, message: error.message });
//                 res.json({ success: true, imageUrl: result.secure_url });
//             }
//         ).end(imageFile.buffer);

//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// }

// export { 
//     listProducts, addProduct, removeProduct, singleProduct, 
//     updateProduct, removeBulkProducts, bulkAddProducts, uploadMedia, listMedia 
// };