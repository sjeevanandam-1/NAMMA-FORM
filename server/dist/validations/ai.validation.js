"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatAssistantSchema = exports.bestMarketSchema = exports.cropRecommendationSchema = exports.sellingStrategySchema = exports.profitAdvisorSchema = void 0;
const zod_1 = require("zod");
exports.profitAdvisorSchema = zod_1.z.object({
    cropName: zod_1.z.string().min(1, 'Crop name is required'),
    landAreaAcre: zod_1.z.number().positive('Land area must be greater than 0'),
    expectedYieldKg: zod_1.z.number().positive('Expected yield must be greater than 0'),
    productionCost: zod_1.z.number().nonnegative('Production cost must be positive'),
    transportCost: zod_1.z.number().nonnegative().default(0),
    sellingPricePerKg: zod_1.z.number().positive('Selling price must be greater than 0'),
    buyerPricePerKg: zod_1.z.number().optional(),
    alternativeMarketPricePerKg: zod_1.z.number().optional(),
});
exports.sellingStrategySchema = zod_1.z.object({
    cropName: zod_1.z.string().min(1, 'Crop name is required'),
    quantityKg: zod_1.z.number().positive('Quantity must be greater than 0'),
    expectedHarvestDate: zod_1.z.string().min(1, 'Harvest date is required'),
    currentLocation: zod_1.z.string().optional(),
});
exports.cropRecommendationSchema = zod_1.z.object({
    state: zod_1.z.string().min(2, 'State is required'),
    district: zod_1.z.string().min(2, 'District is required'),
    soilType: zod_1.z.string().min(2, 'Soil type is required'),
    landAreaAcre: zod_1.z.number().positive('Land area is required'),
    season: zod_1.z.string().min(2, 'Season is required'),
    waterAvailability: zod_1.z.string().min(2, 'Water availability is required'),
    budget: zod_1.z.number().optional(),
});
exports.bestMarketSchema = zod_1.z.object({
    cropName: zod_1.z.string().min(1, 'Crop name is required'),
    quantityKg: zod_1.z.number().positive('Quantity must be greater than 0'),
    farmerLat: zod_1.z.number().optional(),
    farmerLon: zod_1.z.number().optional(),
    state: zod_1.z.string().optional(),
    district: zod_1.z.string().optional(),
});
exports.chatAssistantSchema = zod_1.z.object({
    message: zod_1.z.string().min(1, 'Message cannot be empty'),
    language: zod_1.z.enum(['en', 'ta']).default('en'),
    conversationHistory: zod_1.z
        .array(zod_1.z.object({
        role: zod_1.z.enum(['user', 'assistant']),
        content: zod_1.z.string(),
    }))
        .optional(),
});
