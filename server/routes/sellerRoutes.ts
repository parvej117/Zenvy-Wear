import { Router } from 'express';
import {
  getSellers,
  getSellerProfile,
  registerSeller,
  getSellerDashboard,
  addSellerProduct,
  updateSellerPackageStatus,
  updateSellerStatusByAdmin
} from '../controllers/sellerController.ts';
import { authenticate, adminOnly, optionalAuth } from '../middleware/auth.ts';

const router = Router();

router.get('/', getSellers);
router.get('/my/dashboard', authenticate, getSellerDashboard);
router.post('/register', optionalAuth, registerSeller);
router.post('/my/products', authenticate, addSellerProduct);
router.put('/my/orders/:orderId/status', authenticate, updateSellerPackageStatus);
router.put('/:id/status', authenticate, adminOnly, updateSellerStatusByAdmin);
router.get('/:id', getSellerProfile);

export default router;
