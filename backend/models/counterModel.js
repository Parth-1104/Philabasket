import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
    id: { type: String, required: true },
    seq: { type: Number, default: 100000 }
});

const counterModel = mongoose.models.counter || mongoose.model('counter', counterSchema);
export default counterModel;