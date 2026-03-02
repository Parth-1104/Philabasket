import mongoose from "mongoose";

const headerSchema = new mongoose.Schema({
    marqueeText: { type: String, default: "• Buy More and Earn More • Global Shipping Protocol Active •" },
    navMenu: [
        {
            title: String,
            groups: [
                {
                    groupName: String,
                    items: [String] // These are the category names
                }
            ]
        }
    ]
});

const headerModel = mongoose.models.header || mongoose.model("header", headerSchema);
export default headerModel;