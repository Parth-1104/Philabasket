import express from 'express';
import { addTrivia, listTrivia, getTrivia, updateTrivia, deleteTrivia } from '../controllers/triviaController.js';
import adminAuth from '../middleware/adminAuth.js';

const triviaRouter = express.Router();

/**
 * @route   POST /api/trivia/add
 * @desc    Create a new trivia section
 * @access  Private (Admin Only)
 */
triviaRouter.post('/add', adminAuth, addTrivia);

/**
 * @route   GET /api/trivia/list
 * @desc    Get all active trivia sections
 * @access  Public
 */
triviaRouter.get('/list', listTrivia);

/**
 * @route   GET /api/trivia/:id
 * @desc    Get a specific trivia section
 * @access  Public
 */
triviaRouter.get('/:id', getTrivia);

/**
 * @route   POST /api/trivia/update
 * @desc    Update a trivia section
 * @access  Private (Admin Only)
 */
triviaRouter.post('/update', adminAuth, updateTrivia);

/**
 * @route   POST /api/trivia/delete
 * @desc    Delete a trivia section
 * @access  Private (Admin Only)
 */
triviaRouter.post('/delete', adminAuth, deleteTrivia);

export default triviaRouter;
