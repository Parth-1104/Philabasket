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
        const skippedRows = []; // To track rows that failed validation
        const filePath = req.file.path;

        // Fetch existing stamp names to prevent duplicates
        const existingStamps = await productModel.find({}, 'name');
        const existingNames = new Set(existingStamps.map(s => s.name.toLowerCase().trim()));

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                try {
                    // 1. Check for Empty Data in Required Fields
                    if (!row.name || !row.price || !row.country || !row.year) {
                        skippedRows.push({ row: row.name || "Unknown", reason: "Missing required fields" });
                        return;
                    }

                    const nameTrimmed = row.name.trim();

                    // 2. Duplicate Check (Case-Insensitive)
                    if (existingNames.has(nameTrimmed.toLowerCase())) {
                        skippedRows.push({ row: nameTrimmed, reason: "Duplicate entry" });
                        return;
                    }

                    // 3. Category Parsing Logic
                    let parsedCategory = [];
                    if (row.category) {
                        const cleanedCategory = row.category.trim();
                        if (cleanedCategory.startsWith('[') && cleanedCategory.endsWith(']')) {
                            parsedCategory = JSON.parse(cleanedCategory);
                        } else {
                            parsedCategory = cleanedCategory.split(',').map(c => c.trim());
                        }
                    }

                    // 4. Data Type & Range Validation
                    const price = Number(row.price);
                    const year = Number(row.year);

                    if (isNaN(price) || price <= 0) {
                        skippedRows.push({ row: nameTrimmed, reason: "Invalid price" });
                        return;
                    }

                    // Add to valid list
                    stamps.push({
                        name: nameTrimmed,
                        description: row.description || "",
                        price: price,
                        category: parsedCategory,
                        year: year,
                        country: row.country.trim(),
                        condition: row.condition || "Used",
                        stock: Number(row.stock) || 1,
                        bestseller: String(row.bestseller).toLowerCase() === 'true',
                        image: [], 
                        date: Date.now()
                    });

                    // Add to local Set to prevent duplicates within the SAME CSV file
                    existingNames.add(nameTrimmed.toLowerCase());

                } catch (rowError) {
                    skippedRows.push({ row: row.name || "Unknown", reason: "Format error" });
                }
            })
            .on('end', async () => {
                try {
                    if (stamps.length === 0) {
                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        return res.json({ 
                            success: false, 
                            message: "No valid data to upload", 
                            errors: skippedRows 
                        });
                    }

                    // Bulk insert with ordered:false so one error doesn't kill the batch
                    await productModel.insertMany(stamps, { ordered: false });
                    
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    
                    res.json({ 
                        success: true, 
                        message: `Successfully added ${stamps.length} stamps.`,
                        skippedCount: skippedRows.length,
                        skippedDetails: skippedRows.slice(0, 10) // Show first 10 errors
                    });

                } catch (err) {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    res.json({ success: false, message: "Database Error: " + err.message });
                }
            });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
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
// Function for removing a single product
const removeProduct = async (req, res) => {
    try {
        // Use destructuring to get the id
        const { id } = req.body;

        if (!id) {
            return res.json({ success: false, message: "ID is required to remove a product" });
        }

        const deletedProduct = await productModel.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.json({ success: false, message: "Stamp not found in inventory" });
        }

        res.json({ success: true, message: "Stamp Removed Successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Function for removing multiple products (Bulk Delete)
const removeBulkProducts = async (req, res) => {
    try {
        const { ids } = req.body; // Expecting an array: ["id1", "id2", ...]

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.json({ success: false, message: "No items selected for deletion" });
        }

        // Use $in operator to delete all items in the array
        await productModel.deleteMany({ _id: { $in: ids } });

        res.json({ success: true, message: `${ids.length} Stamps removed successfully` });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
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

const updateProduct = async (req, res) => {
    try {
        // 1. Added 'stock' to the destructuring
        const { id, name, country, year, price, category, stock } = req.body;

        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            {
                name,
                country,
                year: Number(year),
                price: Number(price),
                stock: Number(stock), // 2. Added stock to the update object
                category 
            },
            { new: true } 
        );

        if (!updatedProduct) {
            return res.json({ success: false, message: "Stamp not found" });
        }

        // --- RESTOCK ALERT LOGIC ---
        // If stock is updated and falls below 5, you could trigger a console log or email here
        if (updatedProduct.stock > 0 && updatedProduct.stock <= 5) {
            console.log(`Restock Alert: ${updatedProduct.name} is low (${updatedProduct.stock} left)`);
        }

        res.json({ success: true, message: "Stamp details updated successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { listProducts, addProduct, removeProduct, singleProduct ,bulkAddStamps,updateProductImages,updateProduct,removeBulkProducts}