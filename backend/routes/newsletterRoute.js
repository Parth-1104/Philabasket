import express from 'express';
import { subscribeToNewsletter, getSubscribers } from '../controllers/newsletterController.js';
import adminAuth from '../middleware/adminAuth.js';

const newsletterRouter = express.Router();

newsletterRouter.post('/subscribe', subscribeToNewsletter);
newsletterRouter.get('/list', adminAuth, getSubscribers);

export default newsletterRouter;