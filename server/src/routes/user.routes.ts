import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { upload } from '../config/multer.js';

const router = Router();

router.get('/public/:id', UserController.getPublicProfile);
router.patch('/profile', authenticateToken, upload.single('avatar'), UserController.updateProfile);

export default router;
