import { Router } from 'express';
import { FinanceController } from '../controllers/finance.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/products', FinanceController.getLoanProducts);
router.post('/calculate-emi', FinanceController.calculateEMI);
router.get('/my-applications', authenticateToken, FinanceController.getMyApplications);
router.post('/apply', authenticateToken, FinanceController.applyLoan);

export default router;
