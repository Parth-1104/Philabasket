import mongoose from "mongoose";

const pollSchema = new mongoose.Schema({
    title: { type: String, required: true },
    question: { type: String, required: true },
    options: [{
        text: { type: String, required: true },
        votes: { type: Number, default: 0 }
    }],
    endDate: { type: Date },
    active: { type: Boolean, default: true },
    votedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], // prevent duplicate votes
}, { timestamps: true });

const pollModel = mongoose.models.poll || mongoose.model("poll", pollSchema);
export default pollModel;

