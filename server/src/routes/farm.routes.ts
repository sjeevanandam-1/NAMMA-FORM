import { Router } from 'express';
import { FarmController } from '../controllers/farm.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole([ROLES.FARMER, ROLES.ADMIN]));

router.get('/my-farms', FarmController.getMyFarms);
router.post('/', FarmController.createFarm);
router.patch('/:id', FarmController.updateFarm);
router.delete('/:id', FarmController.deleteFarm);

export default router;
