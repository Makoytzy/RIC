/**
 * ============================================================================
 * BARCODE ROUTES
 * ============================================================================
 * API endpoints for barcode generation and traceability
 * ============================================================================
 */

import express from 'express';
import {
  createBarcodeController,
  getBarcodesController,
  getBarcodeConfigController,
  getTraceabilityController,
  deactivateBarcodeController
} from '../controllers/barcodeController.js';

const router = express.Router();

/**
 * GET /api/barcodes/config
 * Get barcode configuration
 */
router.get('/config', getBarcodeConfigController);

/**
 * GET /api/barcodes
 * List barcodes with traceability info
 */
router.get('/', getBarcodesController);

/**
 * POST /api/barcodes
 * Generate new barcodes
 */
router.post('/', createBarcodeController);

/**
 * GET /api/barcodes/trace/:barcodeValue
 * Get traceability chain for QR code scanning
 */
router.get('/trace/:barcodeValue', getTraceabilityController);

/**
 * PATCH /api/barcodes/:id/deactivate
 * Deactivate a barcode (soft delete)
 */
router.patch('/:id/deactivate', deactivateBarcodeController);

export default router;
