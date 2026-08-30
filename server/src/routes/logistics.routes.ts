import { Router } from 'express';
import { LogisticsController } from '../controllers/logistics.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/request', LogisticsController.requestTransport);
router.get('/track/:trackingNumber', LogisticsController.getDeliveryStatus);

export default router;
