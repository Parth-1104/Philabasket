import express from 'express';
import { getAllMedia } from '../controllers/mediaController.js';
import adminAuth from '../middleware/adminAuth.js'; // Ensure you import your admin auth

const mediaRouter = express.Router();

// Protected route for the management console
mediaRouter.get('/all', adminAuth, getAllMedia);

export default mediaRouter;