import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as warehouseLocationController from '../controllers/warehouseLocationController.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/warehouse-locations - Get all locations
router.get('/', warehouseLocationController.getWarehouseLocations);

// GET /api/warehouse-locations/available - Get available locations
router.get('/available', warehouseLocationController.getAvailableLocations);

// GET /api/warehouse-locations/:id - Get location by ID
router.get('/:id', warehouseLocationController.getWarehouseLocationById);

// POST /api/warehouse-locations - Create location
router.post('/', warehouseLocationController.createWarehouseLocation);

// PUT /api/warehouse-locations/:id - Update location
router.put('/:id', warehouseLocationController.updateWarehouseLocation);

// DELETE /api/warehouse-locations/:id - Delete location
router.delete('/:id', warehouseLocationController.deleteWarehouseLocation);

// POST /api/warehouse-locations/assign-batch - Assign batch to location
router.post('/assign-batch', warehouseLocationController.assignBatchToLocation);

export default router;
