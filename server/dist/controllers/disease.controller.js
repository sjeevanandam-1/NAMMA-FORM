"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiseaseController = void 0;
const fs_1 = __importDefault(require("fs"));
const response_js_1 = require("../utils/response.js");
const ai_inference_service_js_1 = require("../services/ai-inference.service.js");
const prisma_js_1 = require("../config/prisma.js");
class DiseaseController {
    /**
     * Complete Real AI Vision Understanding + Disease Diagnosis Pipeline
     */
    static async validateImage(req, res) {
        try {
            const { cropName, imageUrl } = req.body;
            let resolvedImageUrl = imageUrl;
            let fileBuffer = undefined;
            let mimeType = undefined;
            if (req.file) {
                fileBuffer = req.file.buffer || (req.file.path ? fs_1.default.readFileSync(req.file.path) : undefined);
                mimeType = req.file.mimetype;
                resolvedImageUrl = `/uploads/${req.file.filename}`;
            }
            if (!resolvedImageUrl && !fileBuffer) {
                (0, response_js_1.sendError)(res, 'No image selected. Please upload a clear photo of your crop, plant, leaf, or fruit.', 400);
                return;
            }
            const farmerId = req.user?.id;
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
            // 4. Valid Leaf Image with Disease Diagnosis
            res.status(200).json({
                success: true,
                status: 'ANALYZED',
                message: 'AI Vision analysis and disease diagnostic completed successfully.',
                data: result,
            });
        }
        catch (err) {
            if (err.name === 'AIModelNotInstalledError' || err.code === 'AI_MODEL_NOT_INSTALLED') {
                res.status(503).json({
                    success: false,
                    status: 'AI_MODEL_NOT_INSTALLED',
                    message: 'AI model not installed. Please start your custom AI model inference service (at AI_MODEL_SERVICE_URL in server/.env) or configure the AI model provider.',
                    guide: {
                        customService: 'Start python app.py in server/ml/ (default http://localhost:8000/predict)',
                        envConfig: 'Set AI_MODEL_SERVICE_URL or GEMINI_API_KEY in server/.env',
                    },
                });
                return;
            }
            console.error('[DiseaseController Error]:', err);
            (0, response_js_1.sendError)(res, err.message || 'Vision AI analysis failed', 500);
        }
    }
    /**
     * Scan image (alias for unified analyze)
     */
    static async scanImage(req, res) {
        return DiseaseController.validateImage(req, res);
    }
    /**
     * Follow-up scan to compare with previous diagnosis
     */
    static async followUpScan(req, res) {
        return DiseaseController.validateImage(req, res);
    }
    /**
     * Get scan history for the farmer
     */
    static async getHistory(req, res) {
        try {
            const scans = await prisma_js_1.prisma.diseaseScan.findMany({
                where: { farmerId: req.user.id },
                include: { recommendation: true },
                orderBy: { createdAt: 'desc' },
                take: 20,
            });
            (0, response_js_1.sendSuccess)(res, scans);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Delete a scan from history
     */
    static async deleteScan(req, res) {
        try {
            const { id } = req.params;
            const scan = await prisma_js_1.prisma.diseaseScan.findFirst({
                where: { id, farmerId: req.user.id },
            });
            if (!scan) {
                (0, response_js_1.sendError)(res, 'Scan not found or unauthorized', 404);
                return;
            }
            await prisma_js_1.prisma.diseaseScan.delete({
                where: { id },
            });
            (0, response_js_1.sendSuccess)(res, { success: true }, 'Scan deleted successfully');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
}
exports.DiseaseController = DiseaseController;
