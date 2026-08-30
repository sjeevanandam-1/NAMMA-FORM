import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/process', PaymentController.processPayment);
router.get('/:id', PaymentController.getPaymentStatus);
router.post('/:id/refund', PaymentController.refundPayment);

export default router;
