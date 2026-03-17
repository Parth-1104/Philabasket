import mongoose from "mongoose";

const presentationSchema = new mongoose.Schema({
    title: { type: String, default: "Presentation" },
    description: { type: String, default: "" },
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: "" },
    publicId: { type: String, default: "" },
    active: { type: Boolean, default: true },
}, { timestamps: true });

const presentationModel = mongoose.model("presentation", presentationSchema);
export default presentationModel;
