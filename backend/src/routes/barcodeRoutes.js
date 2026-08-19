import express from 'express';
import * as barcodeController from '../controllers/barcodeController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Configuration endpoints
router.get('/config', barcodeController.getBarcodeConfig);
router.post('/config', barcodeController.updateBarcodeConfig);
router.put('/config', barcodeController.updateBarcodeConfig);
router.post('/validate', barcodeController.validateBarcode);

// CRUD endpoints
router.post('/', barcodeController.createBarcode);
router.get('/', barcodeController.listBarcodes);
router.get('/:barcode', barcodeController.getBarcode);
router.put('/:id', barcodeController.updateBarcodeById);
router.delete('/:id', barcodeController.deleteBarcodeById);

// Scan endpoint
router.post('/:barcode/scan', barcodeController.scanBarcode);

export default router;
