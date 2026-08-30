import { Router } from 'express';
import { ExpertController } from '../controllers/expert.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', ExpertController.getExperts);
router.get('/my-consultations', authenticateToken, ExpertController.getMyConsultations);
router.post('/book', authenticateToken, ExpertController.bookConsultation);
router.post('/review', authenticateToken, ExpertController.reviewExpert);

export default router;
