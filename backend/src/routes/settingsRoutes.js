import express from 'express';
import * as settingsController from '../controllers/settingsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', settingsController.getSettings);
router.post('/', settingsController.updateSettings);
router.put('/', settingsController.updateSettings);

export default router;
