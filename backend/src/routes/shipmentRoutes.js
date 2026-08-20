/**
 * ============================================================================
 * SHIPMENT ROUTES
 * ============================================================================
 */

import express from 'express';
import {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  receiveShipment,
  deleteShipment
} from '../controllers/shipmentController.js';
import { getBatchesByShipment } from '../controllers/batchController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All shipment routes require authentication
router.use(authenticate);

// Shipment CRUD
router.get('/', getShipments);
router.get('/:id', getShipmentById);
router.post('/', createShipment);
router.put('/:id', updateShipment);
router.delete('/:id', deleteShipment);

// Shipment actions
router.post('/:id/receive', receiveShipment);

// Get batches for a shipment
router.get('/:shipmentId/batches', getBatchesByShipment);

export default router;
