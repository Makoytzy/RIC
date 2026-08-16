import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Employee verification endpoint (public)
router.post('/verify-employee-code', authController.verifyEmployeeCode);

// Auth endpoints
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.post('/signout', authMiddleware, authController.signOut);
router.get('/me', authMiddleware, authController.me);

export default router;
