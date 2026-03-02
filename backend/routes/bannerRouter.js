import express from 'express';
import { addBanner, listBanners, updateBanner, removeBanner } from '../controllers/bannerController.js';
import adminAuth from '../middleware/adminAuth.js';

const bannerRouter = express.Router();

/**
 * PUBLIC ROUTES
 * These are accessed by the frontend homepage to display the slides.
 */
bannerRouter.get('/list', listBanners);

/**
 * PROTECTED ADMIN ROUTES
 * These require a valid admin token in the headers.
 */
bannerRouter.post('/add', adminAuth, addBanner);
bannerRouter.post('/update', adminAuth, updateBanner);
bannerRouter.post('/remove', adminAuth, removeBanner);

export default bannerRouter;