import express from 'express';
import { 
    listCategories, 
    addCategory, 
    removeCategory, 
    updateCategory 
} from '../controllers/categoryController.js';
import adminAuth from '../middleware/adminAuth.js'; // Ensure only admins can modify

const categoryRouter = express.Router();

// Public route: Used by Collection and Home pages
categoryRouter.get('/list', listCategories);

// Admin protected routes: Used by CategoryManager and Add pages
categoryRouter.post('/add', adminAuth, addCategory);
categoryRouter.post('/remove', adminAuth, removeCategory);
categoryRouter.post('/update', adminAuth, updateCategory);

export default categoryRouter;