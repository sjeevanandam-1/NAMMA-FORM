import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole([ROLES.ADMIN]));

router.get('/users', AdminController.getAllUsers);
router.patch('/users/:id/verify', AdminController.verifyUser);
router.get('/stats', AdminController.getPlatformStats);
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
