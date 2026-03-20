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
const addBlog = async (req, res) => {
    try {
        const { title, content, author, category, youtubeUrl, image: existingImageUrl } = req.body;
        const imageFile = req.file;
        let finalImageUrl = existingImageUrl || "";

        // Handle Image Upload if present
        if (imageFile) {
            const b64 = Buffer.from(imageFile.buffer).toString("base64");
            let dataURI = "data:" + imageFile.mimetype + ";base64," + b64;
            const imageUpload = await cloudinary.uploader.upload(dataURI, { resource_type: 'image' });
            finalImageUrl = imageUpload.secure_url;
        }

        // --- UPDATED SAFETY CHECK ---
        // Block only if BOTH image and youtubeUrl are missing
        if (!finalImageUrl && !youtubeUrl) {
            return res.json({ 
                success: false, 
                message: "Archive Protocol: Provide either a Specimen Image or a YouTube Video Link." 
            });
        }

        const blogData = new blogModel({
            title,
            content,
            author,
            category,
            youtubeUrl: youtubeUrl || "",
            image: finalImageUrl, // Can now be an empty string
            date: Date.now()
        });

        await blogData.save();
        res.json({ success: true, message: "Article Published to Archive" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const updateBlog = async (req, res) => {
    try {
        const { id, title, content, category, youtubeUrl, image: existingImageUrl } = req.body;
        
        const updateData = { 
            title, 
            content, 
            category, 
            youtubeUrl: youtubeUrl || "" 
        };

        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const imageUpload = await cloudinary.uploader.upload(dataURI, { resource_type: 'image' });
            updateData.image = imageUpload.secure_url;
        } else if (existingImageUrl !== undefined) {
            // Allows explicitly setting image to empty string if removing it
            updateData.image = existingImageUrl;
        }

        const updatedBlog = await blogModel.findByIdAndUpdate(id, updateData, { new: true });
        res.json({ success: true, message: "Archive Article Updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

const listBlogs = async (req, res) => {
    try {
        const blogs = await blogModel.find({}).sort({ date: -1 });
        res.json({ success: true, blogs });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export { addBlog, listBlogs,removeBlog,updateBlog };