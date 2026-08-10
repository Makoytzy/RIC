import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRole('admin', 'manager'), userController.listUsers);
router.post('/', requireRole('admin'), userController.createUser);
router.patch('/:id/active', requireRole('admin'), userController.setActive);

export default router;
