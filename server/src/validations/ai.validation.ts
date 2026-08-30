import { z } from 'zod';

export const profitAdvisorSchema = z.object({
  cropName: z.string().min(1, 'Crop name is required'),
  landAreaAcre: z.number().positive('Land area must be greater than 0'),
  expectedYieldKg: z.number().positive('Expected yield must be greater than 0'),
  productionCost: z.number().nonnegative('Production cost must be positive'),
  transportCost: z.number().nonnegative().default(0),
  sellingPricePerKg: z.number().positive('Selling price must be greater than 0'),
  buyerPricePerKg: z.number().optional(),
  alternativeMarketPricePerKg: z.number().optional(),
});

export const sellingStrategySchema = z.object({
  cropName: z.string().min(1, 'Crop name is required'),
  quantityKg: z.number().positive('Quantity must be greater than 0'),
  expectedHarvestDate: z.string().min(1, 'Harvest date is required'),
  currentLocation: z.string().optional(),
});

export const cropRecommendationSchema = z.object({
  state: z.string().min(2, 'State is required'),
  district: z.string().min(2, 'District is required'),
  soilType: z.string().min(2, 'Soil type is required'),
  landAreaAcre: z.number().positive('Land area is required'),
  season: z.string().min(2, 'Season is required'),
  waterAvailability: z.string().min(2, 'Water availability is required'),
  budget: z.number().optional(),
});

export const bestMarketSchema = z.object({
  cropName: z.string().min(1, 'Crop name is required'),
  quantityKg: z.number().positive('Quantity must be greater than 0'),
  farmerLat: z.number().optional(),
  farmerLon: z.number().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
});

export const chatAssistantSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  language: z.enum(['en', 'ta']).default('en'),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional(),
});
