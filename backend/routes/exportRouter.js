import express from 'express';

import adminAuth from '../middleware/adminAuth.js';
import { exportOrders } from '../controllers/exportController.js';

const exportRouter = express.Router();

// The route is POST because we are sending complex filter objects (date ranges, statuses, etc.)
exportRouter.post('/registry-export', adminAuth, exportOrders);

export default exportRouter;