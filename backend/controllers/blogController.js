import blogModel from "../models/blogModel.js";
import { v2 as cloudinary } from 'cloudinary';

// Remove Blog
const removeBlog = async (req, res) => {
    try {
        await blogModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Blog Removed" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Update Blog
const updateBlog = async (req, res) => {
    try {
        const { id, title, content, category, youtubeUrl, image: existingImageUrl } = req.body;
        
        // Prepare the base update object
        const updateData = { 
            title, 
            content, 
            category, 
            youtubeUrl: youtubeUrl || "" 
        };

        // Handle Image Update (Priority: New File > Existing Registry URL > Keep Current)
        if (req.file) {
            // Processing buffer for Cloudinary
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const imageUpload = await cloudinary.uploader.upload(dataURI, { resource_type: 'image' });
            updateData.image = imageUpload.secure_url;
        } else if (existingImageUrl) {
            // If admin picked a different image from the Cloudinary list
            updateData.image = existingImageUrl;
        }

        const updatedBlog = await blogModel.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!updatedBlog) {
            return res.json({ success: false, message: "Registry entry not found" });
        }

        res.json({ success: true, message: "Archive Article Updated", blog: updatedBlog });
    } catch (error) {
        console.error("Update Error:", error);
        res.json({ success: false, message: error.message });
    }
}


const addBlog = async (req, res) => {
    try {
        const { title, content, author, category, youtubeUrl, image: existingImageUrl } = req.body;
        const imageFile = req.file;
        let finalImageUrl = existingImageUrl;

        // If a new file is uploaded from device, prioritize it
        if (imageFile) {
            const b64 = Buffer.from(imageFile.buffer).toString("base64");
            let dataURI = "data:" + imageFile.mimetype + ";base64," + b64;
            const imageUpload = await cloudinary.uploader.upload(dataURI, { resource_type: 'image' });
            finalImageUrl = imageUpload.secure_url;
        }

        if (!finalImageUrl) {
            return res.json({ success: false, message: "Specimen image is missing" });
        }

        const blogData = new blogModel({
            title,
            content,
            author,
            category,
            youtubeUrl: youtubeUrl || "",
            image: finalImageUrl,
            date: Date.now()
        });

        await blogData.save();
        res.json({ success: true, message: "Article Published to Archive" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const listBlogs = async (req, res) => {
    try {
        const blogs = await blogModel.find({}).sort({ date: -1 });
        res.json({ success: true, blogs });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export { addBlog, listBlogs,removeBlog,updateBlog };