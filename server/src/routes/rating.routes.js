import express from 'express';
import {
  submitRating,
  updateRating,
  getMyRatings,
} from '../controllers/rating.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  ratingSchema,
  updateRatingSchema,
} from '../validators/schemas.js';

const router = express.Router();

// Ratings routes are only accessible to NORMAL_USER
router.use(authenticate, authorize('NORMAL_USER'));

router.post('/', validate(ratingSchema), submitRating);
router.put('/:id', validate(updateRatingSchema), updateRating);
router.get('/my-ratings', getMyRatings);

export default router;
