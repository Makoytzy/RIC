import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// ============================================
// ORDER ROUTES
// ============================================
router.get('/',
  authorize(['operational_staff', 'sales_staff', 'manager', 'admin']),
  orderController.getOrders
);

router.get('/:id',
  authorize(['operational_staff', 'sales_staff', 'manager', 'admin']),
  orderController.getOrderById
);

router.post('/',
  authorize(['operational_staff', 'sales_staff']),
  orderController.createOrder
);

router.put('/:id',
  authorize(['operational_staff', 'sales_staff', 'manager']),
  orderController.updateOrder
);

router.patch('/:id/status',
  authorize(['operational_staff', 'manager']),
  orderController.updateOrderStatus
);

router.delete('/:id',
  authorize(['operational_staff', 'manager', 'admin']),
  orderController.deleteOrder
);

// ============================================
// RETURNS ROUTES
// ============================================
router.get('/returns',
  authorize(['operational_staff', 'sales_staff', 'warehouse_staff', 'manager', 'admin']),
  orderController.getReturns
);

router.post('/returns',
  authorize(['sales_staff', 'operational_staff']),
  orderController.createReturn
);

router.patch('/returns/:id/status',
  authorize(['operational_staff', 'sales_staff', 'manager']),
  orderController.updateReturnStatus
);

export default router;
