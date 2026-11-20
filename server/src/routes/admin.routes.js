import express from 'express';
import {
  getDashboardStats,
  getUsers,
  getUserById,
  createUser,
  getStores,
  createStore,
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  adminCreateUserSchema,
  adminCreateStoreSchema,
} from '../validators/schemas.js';

const router = express.Router();

// All routes require SYSTEM_ADMIN role
router.use(authenticate, authorize('SYSTEM_ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', validate(adminCreateUserSchema), createUser);
router.get('/stores', getStores);
router.post('/stores', validate(adminCreateStoreSchema), createStore);

export default router;
