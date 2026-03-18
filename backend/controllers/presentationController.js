import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import presentationModel from "../models/presentationModel.js";

// Upload a PPTX (or other supported presentation file) and store as the active presentation
export const uploadPresentation = async (req, res) => {
    try {
        const { title, description } = req.body;
        const file = req.file;

        if (!file) {
            return res.json({ success: false, message: "No file uploaded" });
        }

        const allowedMime = [
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.ms-powerpoint",
            "application/pdf"
        ];

        if (!allowedMime.includes(file.mimetype)) {
            return res.json({ success: false, message: "Only PPTX/PPT/PDF files are supported" });
        }

        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "raw",
                    folder: "philabasket_presentations",
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
        });

        // Mark other presentations inactive (keep history, but only one is active)
        await presentationModel.updateMany({ active: true }, { active: false });

        const created = await presentationModel.create({
            title: title || file.originalname,
            description: description || "",
            fileUrl: uploadResult.secure_url,
            fileName: file.originalname,
            publicId: uploadResult.public_id,
            active: true,
        });

        res.json({ success: true, presentation: created });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export const getActivePresentation = async (req, res) => {
    try {
        const presentation = await presentationModel.findOne({ active: true }).sort({ createdAt: -1 });
        if (!presentation) {
            return res.json({ success: true, presentation: null });
        }
        res.json({ success: true, presentation });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export const listPresentations = async (req, res) => {
    try {
        const presentations = await presentationModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, presentations });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};