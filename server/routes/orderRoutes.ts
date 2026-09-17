import { Router } from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus, updatePaymentStatus } from '../controllers/orderController.ts';
import { authenticate, optionalAuth, adminOnly } from '../middleware/auth.ts';

const router = Router();

router.post('/', optionalAuth, createOrder);
router.get('/', authenticate, getOrders);
router.get('/:id', optionalAuth, getOrderById);
router.put('/:id/status', authenticate, adminOnly, updateOrderStatus);
router.put('/:id/payment', authenticate, adminOnly, updatePaymentStatus);

export default router;
