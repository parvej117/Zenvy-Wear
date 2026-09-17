import { Router } from 'express';
import { getReviewsByProduct, createReview, deleteReview, getAllReviews } from '../controllers/reviewController.ts';
import { authenticate, optionalAuth, adminOnly } from '../middleware/auth.ts';

const router = Router();

router.get('/', getAllReviews);
router.get('/:productId', getReviewsByProduct);
router.post('/', authenticate, createReview);
router.delete('/:id', authenticate, adminOnly, deleteReview);

export default router;
