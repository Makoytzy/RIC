import express from 'express';
import * as auditLogController from '../controllers/auditLogController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', auditLogController.listAuditLogs);
router.post('/', auditLogController.createAuditLog);

export default router;
