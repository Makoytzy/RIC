import express from 'express';
import * as warehouseController from '../controllers/warehouseController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All warehouse routes require authentication
router.use(authenticate);

// ============================================
// RECEIVING ROUTES
// ============================================
router.get('/receiving',
  authorize(['warehouse_staff', 'manager', 'admin']),
  warehouseController.getReceivingShipments
);

router.post('/receiving/:id/receive',
  authorize(['warehouse_staff']),
  warehouseController.receiveShipment
);

// ============================================
// WAREHOUSE LOCATIONS ROUTES
// ============================================
router.get('/locations',
  authorize(['admin', 'manager', 'operational_staff', 'warehouse_staff', 'sales_staff']),
  warehouseController.getLocations
);

router.post('/locations',
  authorize(['admin', 'manager', 'operational_staff']),
  warehouseController.createLocation
);

router.put('/locations/:id',
  authorize(['admin', 'manager', 'operational_staff']),
  warehouseController.updateLocation
);

router.delete('/locations/:id',
  authorize(['admin']),
  warehouseController.deleteLocation
);

// ============================================
// INSPECTION ROUTES
// ============================================
router.get('/inspection',
  authorize(['warehouse_staff', 'manager', 'admin']),
  warehouseController.getInspectionQueue
);

router.post('/inspection/:id/complete',
  authorize(['warehouse_staff']),
  warehouseController.completeInspection
);

// ============================================
// PICKING ROUTES
// ============================================
router.get('/picking',
  authorize(['warehouse_staff', 'manager', 'admin']),
  warehouseController.getPickingTasks
);

router.post('/picking/:id/complete',
  authorize(['warehouse_staff']),
  warehouseController.completePicking
);

// ============================================
// PACKING ROUTES
// ============================================
router.get('/packing',
  authorize(['warehouse_staff', 'manager', 'admin']),
  warehouseController.getPackingTasks
);

router.post('/packing/:id/complete',
  authorize(['warehouse_staff']),
  warehouseController.completePacking
);

export default router;
