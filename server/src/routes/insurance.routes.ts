import { Router } from 'express';
import { InsuranceController } from '../controllers/insurance.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/products', InsuranceController.getInsuranceProducts);
router.post('/calculate-premium', InsuranceController.calculatePremium);
router.get('/my-policies', authenticateToken, InsuranceController.getMyPolicies);
router.post('/enroll', authenticateToken, InsuranceController.enrollPolicy);
router.post('/claims', authenticateToken, InsuranceController.fileClaim);

export default router;
