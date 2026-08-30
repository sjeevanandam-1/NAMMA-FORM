import { Router } from 'express';
import { PassportController } from '../controllers/passport.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/my-passport', authenticateToken, PassportController.getFarmerPassport);

export default router;
