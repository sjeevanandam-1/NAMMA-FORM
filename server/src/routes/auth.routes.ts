import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

router.post('/register/farmer', authLimiter, AuthController.registerFarmer);
router.post('/register/buyer', authLimiter, AuthController.registerBuyer);
router.post('/otp/send', authLimiter, AuthController.sendOTP);
router.post('/otp/verify', authLimiter, AuthController.verifyOTP);
router.post('/login', authLimiter, AuthController.login);
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/reset-password', authLimiter, AuthController.resetPassword);
router.post('/refresh', AuthController.refresh);
router.get('/me', authenticateToken, AuthController.getMe);
router.post('/logout', authenticateToken, AuthController.logout);

export default router;
