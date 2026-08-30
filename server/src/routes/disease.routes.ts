import { Router } from 'express';
import { DiseaseController } from '../controllers/disease.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { upload } from '../config/multer.js';

const router = Router();

router.post('/validate-image', authenticateToken, upload.single('image'), DiseaseController.validateImage);
router.post('/scan', authenticateToken, upload.single('image'), DiseaseController.scanImage);
router.post('/follow-up', authenticateToken, upload.single('image'), DiseaseController.followUpScan);
router.get('/history', authenticateToken, DiseaseController.getHistory);
router.delete('/history/:id', authenticateToken, DiseaseController.deleteScan);

export default router;
