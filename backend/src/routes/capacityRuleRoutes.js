import express from 'express';
import * as capacityRuleController from '../controllers/capacityRuleController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', capacityRuleController.listCapacityRules);
router.post('/', capacityRuleController.createCapacityRule);
router.put('/:id', capacityRuleController.updateCapacityRule);
router.patch('/:id', capacityRuleController.updateCapacityRule);
router.delete('/:id', capacityRuleController.deleteCapacityRule);

export default router;
