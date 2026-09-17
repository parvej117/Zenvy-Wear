import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart, applyCoupon } from '../controllers/cartController.ts';
import { optionalAuth } from '../middleware/auth.ts';

const router = Router();

router.get('/', optionalAuth, getCart);
router.post('/', optionalAuth, addToCart);
router.post('/coupon', optionalAuth, applyCoupon);
router.put('/:id', optionalAuth, updateCartItem);
router.delete('/:id', optionalAuth, removeCartItem);
router.delete('/', optionalAuth, clearCart);

export default router;
