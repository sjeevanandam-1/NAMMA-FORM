import { Router } from 'express';
import { CropController } from '../controllers/crop.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', CropController.getAllCrops);
router.get('/:id', CropController.getCropById);
router.post('/', authenticateToken, requireRole([ROLES.ADMIN]), CropController.createCrop);

export default router;
