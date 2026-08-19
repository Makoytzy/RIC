import express from 'express';
import * as traceabilityController from '../controllers/traceabilityController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All traceability routes require authentication
router.use(authenticate);

// GET /api/traceability/:barcode - Full traceability data
router.get('/:barcode', traceabilityController.getTraceability);

// GET /api/traceability/:barcode/timeline - Chronological event timeline
router.get('/:barcode/timeline', traceabilityController.getTraceabilityTimeline);

export default router;
