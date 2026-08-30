import { Router } from 'express';
import { AIController } from '../controllers/ai.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { upload } from '../config/multer.js';

const router = Router();

// Modular Real AI Crop Vision Inference API
router.post('/analyze-crop', authenticateToken, upload.single('image'), AIController.analyzeCrop);
router.get('/model-status', AIController.getModelStatus);

// Agricultural Decision Engines
router.get('/price-forecast', AIController.getPriceForecast);
router.post('/profit-advisor', authenticateToken, AIController.getProfitAdvice);
router.post('/best-market', AIController.getBestMarket);
router.post('/selling-strategy', AIController.getSellingStrategy);
router.post('/crop-recommendation', AIController.getCropRecommendations);
router.get('/matchmaking', AIController.getBuyerMatches);
router.post('/chat', authenticateToken, AIController.chat);
router.post('/assistant/chat', authenticateToken, AIController.assistantChat);
router.get('/assistant/history', authenticateToken, AIController.getAssistantHistory);
router.delete('/assistant/clear', authenticateToken, AIController.clearAssistantHistory);

export default router;
