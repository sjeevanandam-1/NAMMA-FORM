import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/', ReviewController.createReview);
router.get('/user/:userId', ReviewController.getUserReviews);

export default router;
