import { Router } from 'express';
import { WasteController } from '../controllers/waste.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/listings', WasteController.getWasteListings);
router.post('/listings', authenticateToken, WasteController.createWasteListing);
router.get('/my-listings', authenticateToken, WasteController.getMyWasteListings);
router.post('/offers', authenticateToken, WasteController.createOffer);

export default router;
