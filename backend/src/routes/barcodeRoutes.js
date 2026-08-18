import express from 'express';
import * as barcodeController from '../controllers/barcodeController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/config', barcodeController.getBarcodeConfig);
router.post('/config', barcodeController.updateBarcodeConfig);
router.put('/config', barcodeController.updateBarcodeConfig);
router.post('/validate', barcodeController.validateBarcode);

export default router;
