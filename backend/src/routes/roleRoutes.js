import { Router } from 'express';
import * as roleController from '../controllers/roleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRole('admin', 'manager'), roleController.listRoles);
router.post('/assign', requireRole('admin'), roleController.assignRole);
router.post('/remove', requireRole('admin'), roleController.removeRole);

export default router;
