import fs from 'fs';
import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.js';
import { AIService } from '../services/ai.service.js';
import { AIInferenceService } from '../services/ai-inference.service.js';
import { MatchmakingService } from '../services/matchmaking.service.js';
import {
  profitAdvisorSchema,
  sellingStrategySchema,
  cropRecommendationSchema,
  bestMarketSchema,
  chatAssistantSchema,
} from '../validations/ai.validation.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class AIController {
  /**
   * 1. AI Price Forecast (7d, 14d, 30d trends)
   */
  static async getPriceForecast(req: Request, res: Response): Promise<void> {
    try {
      const crop = (req.query.crop as string) || 'Tomato';
      const state = (req.query.state as string) || 'Tamil Nadu';

      const forecast = await AIService.getPriceForecast(crop, state);
      sendSuccess(res, forecast, 'AI price forecast generated');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * 2. AI Profit Advisor (Highest NET Return calculation)
   */
  static async getProfitAdvice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = profitAdvisorSchema.parse(req.body);
      const farmerId = req.user?.id;

      const advice = await AIService.calculateProfitAdvice({
        ...data,
        farmerId,
      });

      sendSuccess(res, advice, 'AI profit advisory calculated');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * 3. AI Best Market ("Where Should I Sell?")
   */
  static async getBestMarket(req: Request, res: Response): Promise<void> {
    try {
      const data = bestMarketSchema.parse(req.body);
      const advice = await AIService.getBestMarket(data);
      sendSuccess(res, advice, 'Best market opportunities calculated');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * 4. AI Selling Strategy Generator
   */
  static async getSellingStrategy(req: Request, res: Response): Promise<void> {
    try {
      const data = sellingStrategySchema.parse(req.body);
      const strategy = await AIService.generateSellingStrategy(data);
      sendSuccess(res, strategy, 'AI selling strategy generated');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * 5. AI Crop Recommendation ("What Should I Grow?")
   */
  static async getCropRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const data = cropRecommendationSchema.parse(req.body);
      const recommendations = await AIService.recommendCrops(data);
      sendSuccess(res, recommendations, 'AI crop recommendations generated');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * 6. AI Farmer-Buyer Matchmaking
   */
  static async getBuyerMatches(req: Request, res: Response): Promise<void> {
    try {
      const cropName = (req.query.crop as string) || 'Tomato';
      const quantityKg = parseFloat((req.query.quantity as string) || '2000');
      const expectedPrice = parseFloat((req.query.price as string) || '30');
      const state = (req.query.state as string) || 'Tamil Nadu';
      const district = (req.query.district as string) || 'Coimbatore';

      const matches = await MatchmakingService.findMatchingBuyers({
        cropName,
        quantityKg,
        expectedPrice,
        state,
        district,
      });

      sendSuccess(res, matches, 'AI matching buyers found');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * 7. Real AI Assistant Chat with PostgreSQL Memory
   */
  static async assistantChat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { message, language, audioInput } = req.body;
      const userId = req.user!.id;

      if (!message || !message.trim()) {
        sendError(res, 'Message is required', 400);
        return;
      }

      const result = await AIService.chatWithAssistant({
        userId,
        message: message.trim(),
        language: language || 'en',
        audioInput: !!audioInput,
      });

      sendSuccess(res, result, 'AI assistant response generated');
    } catch (err: any) {
      sendError(res, err.message || 'AI Assistant is currently unavailable. Please try again later.', 500);
    }
  }

  /**
   * 8. Get AI Assistant Conversation History
   */
  static async getAssistantHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const history = await AIService.getConversationHistory(req.user!.id);
      sendSuccess(res, history);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch conversation history', 500);
    }
  }

  /**
   * 9. Clear AI Assistant Conversation History
   */
  static async clearAssistantHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await AIService.clearConversationHistory(req.user!.id);
      sendSuccess(res, result, 'Conversation history cleared');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to clear conversation history', 500);
    }
  }

  /**
   * 10. Real AI Crop Vision Inference API (Modular Engine)
   */
  static async analyzeCrop(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { cropName, imageUrl } = req.body;
      const farmerId = req.user?.id;

      let fileBuffer: Buffer | undefined = undefined;
      let mimeType: string | undefined = undefined;
      let resolvedImageUrl = imageUrl;

      if (req.file) {
        fileBuffer = req.file.buffer || (req.file.path ? fs.readFileSync(req.file.path) : undefined);
        mimeType = req.file.mimetype;
        resolvedImageUrl = `/uploads/${req.file.filename}`;
      }

      const result = await AIInferenceService.analyzeCrop({
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
          message:
            result.suitabilityMessage ||
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
    } catch (err: any) {
      if (err.name === 'AIModelNotInstalledError' || err.code === 'AI_MODEL_NOT_INSTALLED') {
        res.status(503).json({
          success: false,
          status: 'AI_MODEL_NOT_INSTALLED',
          message:
            'AI model not installed. Please start your custom AI model inference service (at AI_MODEL_SERVICE_URL in server/.env) or deploy the trained model.',
          guide: {
            customService: 'Start python app.py in server/ml/ (default http://localhost:8000/predict)',
            envConfig: 'Set AI_MODEL_SERVICE_URL or GEMINI_API_KEY in server/.env',
          },
        });
        return;
      }

      console.error('[AI Crop Inference Error]:', err);
      sendError(res, err.message || 'AI crop analysis failed', 500);
    }
  }

  /**
   * 11. AI Inference Subsystem Status Check
   */
  static async getModelStatus(_req: Request, res: Response): Promise<void> {
    try {
      const status = await AIInferenceService.getModelStatus();
      sendSuccess(res, status, 'AI model subsystem status');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to check AI model status', 500);
    }
  }

  /**
   * Legacy quick chat handler
   */
  static async chat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = chatAssistantSchema.parse(req.body);
      const farmerId = req.user?.id;

      const reply = await AIService.handleAgriAIChat({
        message: data.message,
        language: data.language,
        farmerId,
      });

      sendSuccess(res, reply, 'AgriAI response generated');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }
}
