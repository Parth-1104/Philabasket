import express from 'express';
import { addBlog, listBlogs, removeBlog, updateBlog } from '../controllers/blogController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const blogRouter = express.Router();

/**
 * @route   POST /api/blog/add
 * @desc    Publish a new article to the registry
 * @access  Private (Admin Only)
 */
blogRouter.post('/add', adminAuth, upload.single('image'), addBlog);

/**
 * @route   GET /api/blog/list
 * @desc    Retrieve all articles from the archive
 * @access  Public
 */
blogRouter.get('/list', listBlogs);
blogRouter.post('/remove', adminAuth, removeBlog);
blogRouter.post('/update', adminAuth, upload.single('image'), updateBlog);

export default blogRouter;