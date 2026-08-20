/**
 * ============================================================================
 * BATCH ROUTES
 * ============================================================================
 */

import express from 'express';
import {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  assignBatchLocation,
  getBatchActivities
} from '../controllers/batchController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All batch routes require authentication
router.use(authenticate);

// Batch CRUD
router.get('/', getBatches);
router.get('/:id', getBatchById);
router.post('/', createBatch);
router.put('/:id', updateBatch);
router.delete('/:id', deleteBatch);

// Batch location assignment & activities
router.post('/:id/assign-location', assignBatchLocation);
router.get('/:id/activities', getBatchActivities);

export default router;
