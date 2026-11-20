import express from 'express';
import { getStores, getStoreById } from '../controllers/store.controller.js';
import { optionalAuthenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', optionalAuthenticate, getStores);
router.get('/:id', optionalAuthenticate, getStoreById);

export default router;
