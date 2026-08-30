import { Router } from 'express';
import { EquipmentController } from '../controllers/equipment.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', EquipmentController.getEquipment);
router.get('/my-bookings', authenticateToken, EquipmentController.getMyBookings);
router.post('/book', authenticateToken, EquipmentController.bookEquipment);

export default router;
