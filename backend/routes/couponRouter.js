import express from 'express';
import { validateCoupon, createCoupon, listCoupons } from '../controllers/couponController.js';
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const couponRouter = express.Router();

// User Route (Checkout)
couponRouter.post('/validate', authUser, validateCoupon);

// Admin Routes
couponRouter.post('/create', adminAuth, createCoupon);
couponRouter.get('/list', adminAuth, listCoupons);

export default couponRouter;