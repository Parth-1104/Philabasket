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
        const { id, title, content, category } = req.body;
        const updateData = { title, content, category };

        if (req.file) {
            const imageUpload = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' });
            updateData.image = imageUpload.secure_url;
        }

        await blogModel.findByIdAndUpdate(id, updateData);
        res.json({ success: true, message: "Blog Updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


const addBlog = async (req, res) => {
    try {
        const { title, content, author, category } = req.body;
        const imageFile = req.file;

        if (!imageFile) {
            return res.json({ success: false, message: "Specimen image is missing" });
        }

        // Convert buffer to Base64/Data URI for Cloudinary
        const b64 = Buffer.from(imageFile.buffer).toString("base64");
        let dataURI = "data:" + imageFile.mimetype + ";base64," + b64;

        // Upload the Data URI instead of imageFile.path
        const imageUpload = await cloudinary.uploader.upload(dataURI, { 
            resource_type: 'image' 
        });

        const blogData = new blogModel({
            title,
            content,
            author,
            category,
            image: imageUpload.secure_url,
            date: Date.now()
        });

        await blogData.save();
        res.json({ success: true, message: "Article Published to Archive" });

    } catch (error) {
        console.error(error);
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