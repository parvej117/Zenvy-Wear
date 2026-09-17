import { Router } from 'express';
import {
  getProducts,
  getFlashSales,
  getCompareProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.ts';
import { authenticate, adminOnly } from '../middleware/auth.ts';

const router = Router();

router.get('/', getProducts);
router.get('/flash-sales', getFlashSales);
router.get('/compare', getCompareProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, adminOnly, createProduct);
router.put('/:id', authenticate, adminOnly, updateProduct);
router.delete('/:id', authenticate, adminOnly, deleteProduct);

export default router;
