import { Router } from 'express';
import { TransportController } from '../controllers/transport.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/vehicles', TransportController.getVehicles);
router.post('/estimate', TransportController.estimateFreight);
router.get('/my-bookings', authenticateToken, TransportController.getMyTransportBookings);
router.post('/book', authenticateToken, TransportController.bookTransport);

export default router;
