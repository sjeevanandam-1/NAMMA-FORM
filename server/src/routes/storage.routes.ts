import { Router } from 'express';
import { StorageController } from '../controllers/storage.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', StorageController.getStorageCenters);
router.get('/my-bookings', authenticateToken, StorageController.getMyStorageBookings);
router.get('/:id', StorageController.getStorageCenterById);
router.post('/book', authenticateToken, StorageController.bookStorage);

export default router;
