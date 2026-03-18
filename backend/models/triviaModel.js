import mongoose from "mongoose";

const triviaSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    trivia: [{
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: Number, required: true, default: 0 },
        image: { type: String, default: "" },
        hint: { type: String, default: "" }
    }],
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const triviaModel = mongoose.models.trivia || mongoose.model("trivia", triviaSchema);
export default triviaModel;