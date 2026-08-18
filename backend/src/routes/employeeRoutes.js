import express from 'express';
import * as employeeController from '../controllers/employeeController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', employeeController.listEmployees);
router.post('/', employeeController.createEmployee);
router.delete('/:id', employeeController.deleteEmployee);

export default router;
