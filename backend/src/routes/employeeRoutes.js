import express from 'express';
import * as employeeController from '../controllers/employeeController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', employeeController.listEmployees);
router.post('/', employeeController.createEmployee);
router.post('/import', employeeController.bulkImportEmployees);  // ADD THIS LINE
router.put('/:id', employeeController.updateEmployee);  // ADD THIS LINE
router.delete('/:id', employeeController.deleteEmployee);

export default router;
