import { Router } from 'express';
import { MarketplaceController } from '../controllers/marketplace.controller.js';

const router = Router();

router.get('/', MarketplaceController.getMarketplaceListings);
router.get('/:id', MarketplaceController.getListingDetail);

export default router;
