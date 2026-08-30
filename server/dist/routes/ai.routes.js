"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_js_1 = require("../controllers/ai.controller.js");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const multer_js_1 = require("../config/multer.js");
const router = (0, express_1.Router)();
// Modular Real AI Crop Vision Inference API
router.post('/analyze-crop', auth_middleware_js_1.authenticateToken, multer_js_1.upload.single('image'), ai_controller_js_1.AIController.analyzeCrop);
router.get('/model-status', ai_controller_js_1.AIController.getModelStatus);
// Agricultural Decision Engines
router.get('/price-forecast', ai_controller_js_1.AIController.getPriceForecast);
router.post('/profit-advisor', auth_middleware_js_1.authenticateToken, ai_controller_js_1.AIController.getProfitAdvice);
router.post('/best-market', ai_controller_js_1.AIController.getBestMarket);
router.post('/selling-strategy', ai_controller_js_1.AIController.getSellingStrategy);
router.post('/crop-recommendation', ai_controller_js_1.AIController.getCropRecommendations);
router.get('/matchmaking', ai_controller_js_1.AIController.getBuyerMatches);
router.post('/chat', auth_middleware_js_1.authenticateToken, ai_controller_js_1.AIController.chat);
router.post('/assistant/chat', auth_middleware_js_1.authenticateToken, ai_controller_js_1.AIController.assistantChat);
router.get('/assistant/history', auth_middleware_js_1.authenticateToken, ai_controller_js_1.AIController.getAssistantHistory);
router.delete('/assistant/clear', auth_middleware_js_1.authenticateToken, ai_controller_js_1.AIController.clearAssistantHistory);
exports.default = router;
