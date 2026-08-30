import { Router } from 'express';
import { GovernmentController } from '../controllers/government.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole([ROLES.GOVERNMENT_OFFICIAL, ROLES.ADMIN]));

router.get('/analytics', GovernmentController.getAnalytics);

export default router;
