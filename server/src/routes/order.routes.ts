import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticateToken);

router.post('/', requireRole([ROLES.BUYER, ROLES.ADMIN]), OrderController.createOrder);
router.get('/my-orders', OrderController.getMyOrders);
router.get('/:id', OrderController.getOrderDetail);
router.patch('/:id/status', OrderController.updateOrderStatus);

export default router;
