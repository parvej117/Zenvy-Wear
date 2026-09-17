import { Router } from 'express';
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/authController.ts';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);

export default router;
