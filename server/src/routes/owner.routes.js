import express from 'express';
import {
  getOwnerDashboard,
  getOwnerRatings,
} from '../controllers/owner.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Owner routes are only accessible to STORE_OWNER
router.use(authenticate, authorize('STORE_OWNER'));

router.get('/dashboard', getOwnerDashboard);
router.get('/ratings', getOwnerRatings);

export default router;
