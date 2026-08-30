import { Router } from 'express';
import { IrrigationController } from '../controllers/irrigation.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/calculate', authenticateToken, IrrigationController.calculateIrrigation);
router.get('/history', authenticateToken, IrrigationController.getMyIrrigationHistory);

export default router;
