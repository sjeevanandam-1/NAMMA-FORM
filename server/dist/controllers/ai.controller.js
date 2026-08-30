"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const fs_1 = __importDefault(require("fs"));
const response_js_1 = require("../utils/response.js");
const ai_service_js_1 = require("../services/ai.service.js");
const ai_inference_service_js_1 = require("../services/ai-inference.service.js");
const matchmaking_service_js_1 = require("../services/matchmaking.service.js");
const ai_validation_js_1 = require("../validations/ai.validation.js");
class AIController {
    /**
     * 1. AI Price Forecast (7d, 14d, 30d trends)
     */
    static async getPriceForecast(req, res) {
        try {
            const crop = req.query.crop || 'Tomato';
            const state = req.query.state || 'Tamil Nadu';
            const forecast = await ai_service_js_1.AIService.getPriceForecast(crop, state);
            (0, response_js_1.sendSuccess)(res, forecast, 'AI price forecast generated');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * 2. AI Profit Advisor (Highest NET Return calculation)
     */
    static async getProfitAdvice(req, res) {
        try {
            const data = ai_validation_js_1.profitAdvisorSchema.parse(req.body);
            const farmerId = req.user?.id;
            const advice = await ai_service_js_1.AIService.calculateProfitAdvice({
                ...data,
                farmerId,
            });
            (0, response_js_1.sendSuccess)(res, advice, 'AI profit advisory calculated');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * 3. AI Best Market ("Where Should I Sell?")
     */
    static async getBestMarket(req, res) {
        try {
            const data = ai_validation_js_1.bestMarketSchema.parse(req.body);
            const advice = await ai_service_js_1.AIService.getBestMarket(data);
            (0, response_js_1.sendSuccess)(res, advice, 'Best market opportunities calculated');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * 4. AI Selling Strategy Generator
     */
    static async getSellingStrategy(req, res) {
        try {
            const data = ai_validation_js_1.sellingStrategySchema.parse(req.body);
            const strategy = await ai_service_js_1.AIService.generateSellingStrategy(data);
            (0, response_js_1.sendSuccess)(res, strategy, 'AI selling strategy generated');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * 5. AI Crop Recommendation ("What Should I Grow?")
     */
    static async getCropRecommendations(req, res) {
        try {
            const data = ai_validation_js_1.cropRecommendationSchema.parse(req.body);
            const recommendations = await ai_service_js_1.AIService.recommendCrops(data);
            (0, response_js_1.sendSuccess)(res, recommendations, 'AI crop recommendations generated');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * 6. AI Farmer-Buyer Matchmaking
     */
    static async getBuyerMatches(req, res) {
        try {
            const cropName = req.query.crop || 'Tomato';
            const quantityKg = parseFloat(req.query.quantity || '2000');
            const expectedPrice = parseFloat(req.query.price || '30');
            const state = req.query.state || 'Tamil Nadu';
            const district = req.query.district || 'Coimbatore';
            const matches = await matchmaking_service_js_1.MatchmakingService.findMatchingBuyers({
                cropName,
                quantityKg,
                expectedPrice,
                state,
                district,
            });
            (0, response_js_1.sendSuccess)(res, matches, 'AI matching buyers found');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * 7. Real AI Assistant Chat with PostgreSQL Memory
     */
    static async assistantChat(req, res) {
        try {
            const { message, language, audioInput } = req.body;
            const userId = req.user.id;
            if (!message || !message.trim()) {
                (0, response_js_1.sendError)(res, 'Message is required', 400);
                return;
            }
            const result = await ai_service_js_1.AIService.chatWithAssistant({
                userId,
                message: message.trim(),
                language: language || 'en',
                audioInput: !!audioInput,
            });
            (0, response_js_1.sendSuccess)(res, result, 'AI assistant response generated');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'AI Assistant is currently unavailable. Please try again later.', 500);
        }
    }
    /**
     * 8. Get AI Assistant Conversation History
     */
    static async getAssistantHistory(req, res) {
        try {
            const history = await ai_service_js_1.AIService.getConversationHistory(req.user.id);
            (0, response_js_1.sendSuccess)(res, history);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to fetch conversation history', 500);
        }
    }
    /**
     * 9. Clear AI Assistant Conversation History
     */
    static async clearAssistantHistory(req, res) {
        try {
            const result = await ai_service_js_1.AIService.clearConversationHistory(req.user.id);
            (0, response_js_1.sendSuccess)(res, result, 'Conversation history cleared');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to clear conversation history', 500);
        }
    }
    /**
     * 10. Real AI Crop Vision Inference API (Modular Engine)
     */
    static async analyzeCrop(req, res) {
        try {
            const { cropName, imageUrl } = req.body;
            const farmerId = req.user?.id;
            let fileBuffer = undefined;
            let mimeType = undefined;
            let resolvedImageUrl = imageUrl;
            if (req.file) {
                fileBuffer = req.file.buffer || (req.file.path ? fs_1.default.readFileSync(req.file.path) : undefined);
                mimeType = req.file.mimetype;
                resolvedImageUrl = `/uploads/${req.file.filename}`;
            }
            const result = await ai_inference_service_js_1.AIInferenceService.analyzeCrop({
                fileBuffer,
                mimeType,
                imageUrl: resolvedImageUrl,
                selectedCrop: cropName || '',
                farmerId,
            });
            // 1. Non-Agricultural Rejection
            if (!result.isAgricultural) {
                res.status(400).json({
                    success: false,
                    status: 'INVALID_AGRICULTURAL_IMAGE',
                    message: `Invalid agricultural image. This image does not appear to contain a crop, plant, leaf, or fruit. (Detected: ${result.detectedSubject}). Please upload a clear crop/plant/leaf/fruit image.`,
                    data: result,
                });
                return;
            }
            // 2. Insufficient Image Quality
            if (result.imageQuality !== 'good' && !result.suitableForDiseaseAnalysis) {
                res.status(400).json({
                    success: false,
                    status: 'QUALITY_INSUFFICIENT',
                    message: 'Image quality is insufficient for reliable analysis. Please upload a clear close-up image of the affected area.',
                    data: result,
                });
                return;
            }
            // 3. Agricultural Produce but not a leaf (e.g. Fruit, Tuber)
            if (!result.suitableForDiseaseAnalysis) {
                res.status(200).json({
                    success: true,
                    status: 'PRODUCE_DETECTED',
                    message: result.suitabilityMessage ||
                        `${result.crop || 'Produce'} detected. This image is not suitable for leaf disease analysis. Please upload a clear image of an affected leaf.`,
                    data: result,
                });
                return;
            }
            // 4. Valid Leaf Image Analyzed
            res.status(200).json({
                success: true,
                status: 'ANALYZED',
                message: 'Crop image analyzed successfully by AI model.',
                data: result,
            });
        }
        catch (err) {
            if (err.name === 'AIModelNotInstalledError' || err.code === 'AI_MODEL_NOT_INSTALLED') {
                res.status(503).json({
                    success: false,
                    status: 'AI_MODEL_NOT_INSTALLED',
                    message: 'AI model not installed. Please start your custom AI model inference service (at AI_MODEL_SERVICE_URL in server/.env) or deploy the trained model.',
                    guide: {
                        customService: 'Start python app.py in server/ml/ (default http://localhost:8000/predict)',
                        envConfig: 'Set AI_MODEL_SERVICE_URL or GEMINI_API_KEY in server/.env',
                    },
                });
                return;
            }
            console.error('[AI Crop Inference Error]:', err);
            (0, response_js_1.sendError)(res, err.message || 'AI crop analysis failed', 500);
        }
    }
    /**
     * 11. AI Inference Subsystem Status Check
     */
    static async getModelStatus(_req, res) {
        try {
            const status = await ai_inference_service_js_1.AIInferenceService.getModelStatus();
            (0, response_js_1.sendSuccess)(res, status, 'AI model subsystem status');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to check AI model status', 500);
        }
    }
    /**
     * Legacy quick chat handler
     */
    static async chat(req, res) {
        try {
            const data = ai_validation_js_1.chatAssistantSchema.parse(req.body);
            const farmerId = req.user?.id;
            const reply = await ai_service_js_1.AIService.handleAgriAIChat({
                message: data.message,
                language: data.language,
                farmerId,
            });
            (0, response_js_1.sendSuccess)(res, reply, 'AgriAI response generated');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
}
exports.AIController = AIController;
