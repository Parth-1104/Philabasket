// models/groupedLedgerModel.js
import mongoose from "mongoose";

const groupedLedgerSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    transactions: { type: Array, default: [] }
}, { minimize: false });

const groupedLedgerModel = mongoose.models.groupedLedger || mongoose.model("groupedLedger", groupedLedgerSchema);
export default groupedLedgerModel;
