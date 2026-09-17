import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.ts';
import { authenticate, adminOnly } from '../middleware/auth.ts';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticate, adminOnly, createCategory);
router.put('/:id', authenticate, adminOnly, updateCategory);
router.delete('/:id', authenticate, adminOnly, deleteCategory);

export default router;
