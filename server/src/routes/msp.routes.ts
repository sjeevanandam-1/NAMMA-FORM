import { Router } from 'express';
import { MSPController } from '../controllers/msp.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/prices', MSPController.getMSPPrices);
router.get('/centers', MSPController.getProcurementCenters);
router.get('/comparison', MSPController.getMarketVsMSPComparison);
router.get('/my-bookings', authenticateToken, MSPController.getMyProcurementHistory);
router.post('/book-slot', authenticateToken, MSPController.bookProcurementSlot);

export default router;
