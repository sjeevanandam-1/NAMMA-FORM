"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIInferenceService = exports.AIModelNotInstalledError = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma_js_1 = require("../config/prisma.js");
class AIModelNotInstalledError extends Error {
    code = 'AI_MODEL_NOT_INSTALLED';
    constructor(message) {
        super(message ||
            'AI model not installed. Please start your custom agricultural AI model service (at AI_MODEL_SERVICE_URL in server/.env) or configure the AI model provider.');
        this.name = 'AIModelNotInstalledError';
    }
}
exports.AIModelNotInstalledError = AIModelNotInstalledError;
class AIInferenceService {
    /**
     * Modular Crop Vision Inference Engine.
     * Dispatches to Custom Trained Python ML Model Microservice, or optional Gemini Vision.
     * If no AI model is configured or running, raises an explicit AIModelNotInstalledError.
     */
    static async analyzeCrop(params) {
        const startTime = Date.now();
        const { imageUrl, selectedCrop = '', farmerId } = params;
        let buffer = params.fileBuffer || null;
        let mime = params.mimeType || 'image/jpeg';
        let localRelativePath = imageUrl || '';
        // 1. Resolve image buffer from local file, data URI, or URL if not already passed
        if (!buffer) {
            if (!imageUrl || !imageUrl.trim()) {
                throw new Error('Please upload an image file of your crop, plant, leaf, or fruit.');
            }
            if (imageUrl.startsWith('data:image')) {
                const parts = imageUrl.split(';base64,');
                mime = parts[0].replace('data:', '');
                buffer = Buffer.from(parts[1], 'base64');
            }
            else if (imageUrl.startsWith('/uploads/')) {
                const localPath = path_1.default.join(process.cwd(), imageUrl.replace(/^\//, ''));
                if (fs_1.default.existsSync(localPath)) {
                    buffer = fs_1.default.readFileSync(localPath);
                    const ext = path_1.default.extname(localPath).toLowerCase().replace('.', '');
                    mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
                }
                else {
                    throw new Error('Uploaded image file not found on server.');
                }
            }
            else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                try {
                    const fetchRes = await fetch(imageUrl);
                    if (fetchRes.ok) {
                        const arrayBuf = await fetchRes.arrayBuffer();
                        buffer = Buffer.from(arrayBuf);
                        const cType = fetchRes.headers.get('content-type');
                        if (cType && cType.startsWith('image/')) {
                            mime = cType;
                        }
                    }
                }
                catch (err) {
                    console.warn('Could not fetch remote image:', err);
                }
            }
        }
        if (!buffer || buffer.length === 0) {
            throw new Error('Valid image data is required for agricultural AI analysis.');
        }
        // Validate size (10MB limit)
        if (buffer.length > 10 * 1024 * 1024) {
            throw new Error('Image size exceeds 10MB limit.');
        }
        const customModelUrl = process.env.AI_MODEL_SERVICE_URL || 'http://localhost:8000/predict';
        const geminiApiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
        const preferredProvider = process.env.AI_PROVIDER || 'auto'; // 'custom_ml' | 'gemini' | 'auto'
        let result = null;
        let providerName = '';
        // 2. Try Custom Trained Python ML Model Service First (if auto or custom_ml)
        if (preferredProvider === 'custom_ml' || preferredProvider === 'auto') {
            try {
                const customRes = await AIInferenceService.callCustomMLService(customModelUrl, buffer, mime, selectedCrop);
                if (customRes) {
                    result = customRes;
                    providerName = 'custom_trained_ml_model';
                }
            }
            catch (customErr) {
                // Only log warning in auto mode
                if (preferredProvider === 'custom_ml') {
                    console.error('[Custom ML Service Error]:', customErr);
                    throw new Error(`Custom AI model service connection failed at ${customModelUrl}: ${customErr.message}`);
                }
            }
        }
        // 3. Fallback to Gemini Vision if configured
        if (!result && (preferredProvider === 'gemini' || preferredProvider === 'auto')) {
            if (geminiApiKey && geminiApiKey.trim() !== '') {
                try {
                    result = await AIInferenceService.callGeminiVision(geminiApiKey, buffer, mime, selectedCrop);
                    providerName = 'gemini_vision_optional';
                }
                catch (geminiErr) {
                    console.error('[Gemini Vision Provider Error]:', geminiErr);
                    if (preferredProvider === 'gemini') {
                        throw geminiErr;
                    }
                }
            }
        }
        // 4. If No AI Model is installed or available
        if (!result) {
            throw new AIModelNotInstalledError('AI model not installed. Please start your custom AI model service (at AI_MODEL_SERVICE_URL in server/.env) or configure a valid AI model provider.');
        }
        result.providerUsed = providerName;
        result.inferenceTimeMs = Date.now() - startTime;
        // 5. Persist to PostgreSQL if agricultural leaf disease diagnosis was performed
        if (farmerId && result.isAgricultural && result.suitableForDiseaseAnalysis && result.analysis) {
            try {
                const confidencePct = Math.round((result.analysis.confidence || 0.85) * 100);
                const severityStr = result.analysis.causeCategory === 'healthy'
                    ? 'LOW'
                    : result.analysis.confidence > 0.8
                        ? 'HIGH'
                        : 'MEDIUM';
                const savedScan = await prisma_js_1.prisma.diseaseScan.create({
                    data: {
                        farmerId,
                        cropName: result.crop || selectedCrop || 'Crop',
                        imageUrl: localRelativePath || '/uploads/crop_scan.jpg',
                        diseaseName: result.analysis.problem,
                        confidenceScore: confidencePct,
                        severity: severityStr,
                        observedSymptoms: result.analysis.symptoms?.join('\n• ') || 'Visual symptoms analyzed by AI model.',
                        possibleCauses: result.analysis.possibleCauses?.map((c) => `${c.name} (${c.likelihood})`).join(', ') || result.analysis.causeCategory,
                        recommendation: {
                            create: {
                                diseaseName: result.analysis.problem,
                                organicTreatment: result.analysis.management?.join('\n• ') || 'Follow integrated pest and disease management guidelines.',
                                chemicalTreatment: result.analysis.causeCategory === 'viral'
                                    ? 'Viruses cannot be cured with chemical sprays. Manage insect vectors (whiteflies/aphids) and rogue infected plants.'
                                    : 'Use only locally registered agricultural products strictly following label guidelines and agricultural department advice.',
                                safetyGuideline: 'Wear protective equipment when spraying. Observe Pre-Harvest Intervals (PHI).',
                                expertConsultationNote: 'If symptoms persist or spread across >20% of your crop, consult your nearest Krishi Vigyan Kendra (KVK) or Block Agricultural Officer.',
                                sourceName: 'ICAR / State Agricultural University Protocols',
                                verificationDate: new Date(),
                            },
                        },
                    },
                    include: {
                        recommendation: true,
                    },
                });
                result.scan = savedScan;
            }
            catch (dbErr) {
                console.error('[Error persisting scan to PostgreSQL]:', dbErr);
            }
        }
        return result;
    }
    /**
     * Dispatches request to local Custom Trained Python ML Model service
     */
    static async callCustomMLService(serviceUrl, buffer, mimeType, selectedCrop) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
        try {
            const formData = new FormData();
            const blob = new Blob([buffer], { type: mimeType });
            formData.append('image', blob, 'crop_image.jpg');
            if (selectedCrop) {
                formData.append('selected_crop', selectedCrop);
            }
            const res = await fetch(serviceUrl, {
                method: 'POST',
                body: formData,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!res.ok) {
                return null;
            }
            const data = (await res.json());
            return {
                isAgricultural: !!data.isAgricultural,
                category: data.category || (data.isAgricultural ? 'crop' : 'non_agricultural'),
                detectedSubject: data.detectedSubject || 'Agricultural subject',
                crop: data.crop || null,
                plantPart: data.plantPart || 'none',
                imageQuality: data.imageQuality || 'good',
                suitableForDiseaseAnalysis: !!data.suitableForDiseaseAnalysis,
                suitabilityMessage: data.suitabilityMessage,
                analysis: data.analysis,
            };
        }
        catch (err) {
            clearTimeout(timeoutId);
            return null;
        }
    }
    /**
     * Dispatches request to Gemini Vision API (Optional Cloud Provider)
     */
    static async callGeminiVision(apiKey, buffer, mimeType, selectedCrop) {
        const base64Data = buffer.toString('base64');
        const prompt = `You are a real custom-trained agricultural vision and plant pathology AI engine.
Analyze this uploaded image.

Rules:
1. SUBJECT IDENTIFICATION:
   - Identify whether the image contains a valid agricultural subject:
     "leaf", "fruit", "vegetable", "crop", "plant", "seed", "flower", or "non_agricultural".
   - If the image is unrelated (e.g. Person, Face, Human, Animal, Dog, Cat, Car, Vehicle, Building, Anime/Manga art, Cartoon, Screenshot, Document, Furniture, Random non-plant object):
     Set isAgricultural=false, category="non_agricultural", detectedSubject="2-4 word description (e.g. Person, Anime illustration)", crop=null, plantPart="none", suitableForDiseaseAnalysis=false.

2. CROP IDENTIFICATION:
   - Identify the actual crop from the image (e.g. "Tomato", "Rice", "Banana", "Potato", "Chilli", "Cotton", "Mango", "Brinjal", "Groundnut", "Sugarcane", "Wheat", "Maize").
   - NEVER assume the crop is "${selectedCrop}" if the image shows something else. The image is ground truth.

3. PLANT PART & SUITABILITY:
   - plantPart: "leaf", "fruit", "flower", "seed", "stem", "root", "whole_plant", or "none".
   - If it is a fruit or vegetable produce (Tomato fruit, Banana bunch, Mango fruit, Potato tuber):
     Set suitableForDiseaseAnalysis=false, suitabilityMessage="[Crop] [Produce] detected. This image is not suitable for leaf disease analysis. Please upload a clear image of an affected leaf."
   - If it is a leaf or foliar shoot:
     Set suitableForDiseaseAnalysis=true.

4. IMAGE QUALITY:
   - "good", "blurry", "too_dark", "low_resolution", "unclear".

5. PATHOLOGY & CAUSE IDENTIFICATION (Only if suitableForDiseaseAnalysis=true):
   - causeCategory: "fungal", "bacterial", "viral", "pest", "nutrient", "environmental", "healthy", "unknown".
   - If healthy: problem="Healthy / No obvious disease detected", causeCategory="healthy".
   - If viral: causeCategory="viral" (Do NOT claim chemicals cure viruses; emphasize vector control, sanitation).
   - If pest damage: causeCategory="pest" (Identify insect pest; provide IPM).
   - Give 2-4 symptoms, possible causes with relative likelihoods, safe management steps, and prevention.

Return ONLY raw valid JSON:
{
  "isAgricultural": boolean,
  "category": "leaf" | "fruit" | "vegetable" | "crop" | "plant" | "seed" | "flower" | "non_agricultural",
  "detectedSubject": string,
  "crop": string or null,
  "plantPart": "leaf" | "fruit" | "flower" | "seed" | "stem" | "root" | "whole_plant" | "none",
  "imageQuality": "good" | "blurry" | "too_dark" | "low_resolution" | "unclear",
  "suitableForDiseaseAnalysis": boolean,
  "suitabilityMessage": string or null,
  "analysis": {
    "status": "possible_disease" | "healthy" | "pest_damage" | "nutrient_deficiency" | "environmental_stress" | "unable_to_identify",
    "problem": string,
    "causeCategory": "fungal" | "bacterial" | "viral" | "pest" | "nutrient" | "environmental" | "healthy" | "unknown",
    "confidence": number,
    "symptoms": string[],
    "possibleCauses": [
      { "name": string, "likelihood": string }
    ],
    "management": string[],
    "prevention": string[],
    "warning": "AI agricultural advisory — image-based results are not a confirmed laboratory diagnosis."
  }
}`;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const visionRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt },
                            { inline_data: { mime_type: mimeType, data: base64Data } },
                        ],
                    },
                ],
            }),
        });
        if (!visionRes.ok) {
            const errText = await visionRes.text();
            throw new Error(`AI Vision service response error (${visionRes.status}): ${errText}`);
        }
        const visionData = (await visionRes.json());
        const textResponse = visionData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResponse) {
            throw new Error('AI Vision model did not return an inference candidate.');
        }
        const cleaned = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
            isAgricultural: !!parsed.isAgricultural,
            category: parsed.category || (parsed.isAgricultural ? 'crop' : 'non_agricultural'),
            detectedSubject: parsed.detectedSubject || (parsed.isAgricultural ? `${parsed.crop || 'Crop'} ${parsed.plantPart || 'Plant'}` : 'Non-agricultural subject'),
            crop: parsed.crop || null,
            plantPart: parsed.plantPart || 'none',
            imageQuality: parsed.imageQuality || 'good',
            suitableForDiseaseAnalysis: !!parsed.suitableForDiseaseAnalysis,
            suitabilityMessage: parsed.suitabilityMessage || undefined,
            analysis: parsed.analysis,
        };
    }
    /**
     * Health status of the AI Inference subsystem
     */
    static async getModelStatus() {
        const customModelUrl = process.env.AI_MODEL_SERVICE_URL || 'http://localhost:8000/predict';
        const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
        let isCustomModelOnline = false;
        try {
            const pingUrl = customModelUrl.replace('/predict', '/health');
            const res = await fetch(pingUrl, { method: 'GET', signal: AbortSignal.timeout(2000) });
            isCustomModelOnline = res.ok;
        }
        catch {
            isCustomModelOnline = false;
        }
        const isGeminiConfigured = !!(geminiKey && geminiKey.trim() !== '');
        return {
            activeProvider: isCustomModelOnline
                ? 'custom_ml_service'
                : isGeminiConfigured
                    ? 'gemini_vision_optional'
                    : 'none',
            customModelService: {
                url: customModelUrl,
                isOnline: isCustomModelOnline,
            },
            geminiOptional: {
                isConfigured: isGeminiConfigured,
            },
            isReadyForInference: isCustomModelOnline || isGeminiConfigured,
        };
    }
}
exports.AIInferenceService = AIInferenceService;
