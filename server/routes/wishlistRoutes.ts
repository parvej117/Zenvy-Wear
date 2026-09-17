import { Router } from 'express';
import { getWishlist, toggleWishlist, removeFromWishlist } from '../controllers/wishlistController.ts';
import { optionalAuth } from '../middleware/auth.ts';

const router = Router();

router.get('/', optionalAuth, getWishlist);
router.post('/', optionalAuth, toggleWishlist);
router.delete('/:id', optionalAuth, removeFromWishlist);

export default router;
