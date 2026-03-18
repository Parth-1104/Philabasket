import express from 'express';
import { addPoll, listPoll, updatePoll, deletePoll, votePoll } from '../controllers/pollController.js';
import adminAuth from '../middleware/adminAuth.js';
import auth from '../middleware/auth.js';

const pollRouter = express.Router();

/**
 * @route   POST /api/poll/add
 * @desc    Create new poll
 * @access  Admin
 */
pollRouter.post('/add', adminAuth, addPoll);

/**
 * @route   GET /api/poll/list
 * @desc    Get active poll
 * @access  Public
 */
pollRouter.get('/list', listPoll);

/**
 * @route   POST /api/poll/update
 * @desc    Update poll
 * @access  Admin
 */
pollRouter.post('/update', adminAuth, updatePoll);

/**
 * @route   POST /api/poll/delete
 * @desc    Delete poll
 * @access  Admin
 */
pollRouter.post('/delete', adminAuth, deletePoll);

/**
 * @route   POST /api/poll/vote
 * @desc    Vote on poll
 * @access  Authenticated User
 */
pollRouter.post('/vote', auth, votePoll);

export default pollRouter;

