import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";
import { uploadPresentation, getActivePresentation, listPresentations } from "../controllers/presentationController.js";

const presentationRouter = express.Router();

// Upload a new presentation (Admin only)
presentationRouter.post('/upload', adminAuth, upload.single('file'), uploadPresentation);

// Get the currently active presentation (public)
presentationRouter.get('/active', getActivePresentation);

// List all presentations (admin)
presentationRouter.get('/all', adminAuth, listPresentations);

export default presentationRouter;
