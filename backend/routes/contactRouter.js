import express from 'express';

import adminAuth from '../middleware/adminAuth.js'; // Ensure this middleware exists
import { addContact, deleteContactMessage, listContactMessages } from '../controllers/contactController.js';

const contactRouter = express.Router();

// Public route (Anyone can send a message)
contactRouter.post('/add', addContact);

// Protected routes (Only Admin can view/delete)
contactRouter.get('/list', adminAuth, listContactMessages);
contactRouter.post('/delete', adminAuth, deleteContactMessage);

export default contactRouter;