import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import fs from 'fs';
import csv from 'csv-parser';


const bulkAddStamps = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: "Please upload a CSV file" });
        }

        const stamps = [];
        const filePath = req.file.path;

        // Parse the CSV file
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                try {
                    // SAFER PARSING: Handle potential malformed JSON in category
                    let parsedCategory = [];
                    if (row.category) {
                        const cleanedCategory = row.category.trim();
                        // Check if it looks like a JSON array, otherwise split by comma
                        if (cleanedCategory.startsWith('[') && cleanedCategory.endsWith(']')) {
                            parsedCategory = JSON.parse(cleanedCategory);
                        } else {
                            parsedCategory = cleanedCategory.split(',').map(c => c.trim());
                        }
                    }

                    stamps.push({
                        name: row.name,
                        description: row.description,
                        price: Number(row.price),
                        category: parsedCategory,
                        year: Number(row.year),
                        country: row.country,
                        condition: row.condition,
                        stock: Number(row.stock) || 1,
                        bestseller: row.bestseller === 'true' || row.bestseller === true,
                        image: [], 
                        date: Date.now()
                    });
                } catch (rowError) {
                    console.error("Error processing row:", row, rowError.message);
                    // We skip the bad row instead of crashing the whole process
                }
            })
            .on('end', async () => {
                try {
                    if (stamps.length === 0) {
                        fs.unlinkSync(filePath);
                        return res.json({ success: false, message: "No valid data found in CSV" });
                    }

                    // Bulk insert into MongoDB
                    await productModel.insertMany(stamps);
                    
                    // Cleanup
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    
                    res.json({ success: true, message: `${stamps.length} Stamps added successfully` });
                } catch (err) {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    res.json({ success: false, message: "Database Error: " + err.message });
                }
            })
            .on('error', (error) => {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                res.json({ success: false, message: "CSV Parsing Error: " + error.message });
            });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const updateProductImages = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.json({ success: false, message: "Product ID is required" });
        }

        const { image1, image2, image3, image4 } = req.files;
        const images = [image1, image2, image3, image4]
            .map(item => item && item[0])
            .filter(item => item !== undefined);

        if (images.length === 0) {
            return res.json({ success: false, message: "No images provided" });
        }

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                // Clean up local file after upload
                if (fs.existsSync(item.path)) fs.unlinkSync(item.path);
                return result.secure_url;
            })
        );

        const updatedProduct = await productModel.findByIdAndUpdate(
            id, 
            { $set: { image: imagesUrl } }, 
            { new: true }
        );

        if (!updatedProduct) {
            return res.json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, message: "Images updated successfully", image: imagesUrl[0] });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}











// function for add product
const addProduct = async (req, res) => {
    try {

        const { name, description, price, category, 
            year, condition, country, stock, bestseller} = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

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
        }

        console.log(productData);

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {
        
        const products = await productModel.find({});
        res.json({success:true,products})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product Removed"})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { listProducts, addProduct, removeProduct, singleProduct ,bulkAddStamps,updateProductImages}