import { Router } from 'express';
import { getDashboardStats, getAllUsers, toggleUserBlock } from '../controllers/adminController.ts';
import { authenticate, adminOnly } from '../middleware/auth.ts';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleUserBlock);

export default router;
