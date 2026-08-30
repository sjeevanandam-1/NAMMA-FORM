import { Router } from 'express';
import { MarketController } from '../controllers/market.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/prices', MarketController.getPrices);
router.get('/history', MarketController.getPriceHistory);
router.post('/import', authenticateToken, requireRole([ROLES.ADMIN]), MarketController.importDataset);

export default router;
