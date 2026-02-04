import express from 'express';
import { listCategories } from '../controllers/categoryController.js';

const categoryRouter = express.Router();

// This will be your fetch URL: /api/category/list
categoryRouter.get('/list', listCategories);

export default categoryRouter;