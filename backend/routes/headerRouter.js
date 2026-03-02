import express from 'express';
import { getHeader, updateHeader } from '../controllers/headerController.js';
import adminAuth from '../middleware/adminAuth.js';

const headerRouter = express.Router();

// Public route: Used by the Navbar on the frontend to display categories
headerRouter.get('/get', getHeader);

// Protected route: Only the Admin can change the navigation structure
headerRouter.post('/update', adminAuth, updateHeader);

export default headerRouter;