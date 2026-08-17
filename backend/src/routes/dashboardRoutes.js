import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

// Get dashboard data based on user's role
router.get('/', dashboardController.getDashboardData);

// Role-specific dashboard endpoints
router.get('/admin', dashboardController.getAdminDashboard);
router.get('/manager', dashboardController.getManagerDashboard);
router.get('/operational', dashboardController.getOperationalDashboard);
router.get('/warehouse', dashboardController.getWarehouseDashboard);
router.get('/sales', dashboardController.getSalesDashboard);

export default router;
