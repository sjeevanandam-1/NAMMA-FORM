import { Router } from 'express';
import { ListingController } from '../controllers/listing.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticateToken);

router.get('/my-listings', requireRole([ROLES.FARMER, ROLES.ADMIN]), ListingController.getMyListings);
router.post('/', requireRole([ROLES.FARMER, ROLES.ADMIN]), ListingController.createListing);
router.patch('/:id', requireRole([ROLES.FARMER, ROLES.ADMIN]), ListingController.updateListing);
router.delete('/:id', requireRole([ROLES.FARMER, ROLES.ADMIN]), ListingController.deleteListing);

export default router;
