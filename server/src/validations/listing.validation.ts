import { z } from 'zod';

export const createListingSchema = z.object({
  cropId: z.string().uuid('Valid crop ID is required'),
  farmId: z.string().uuid().optional(),
  variety: z.string().min(1, 'Variety is required'),
  quantityKg: z.number().positive('Quantity must be greater than 0'),
  unit: z.string().default('KG'),
  expectedPricePerKg: z.number().positive('Expected price must be greater than 0'),
  minAcceptablePrice: z.number().positive('Minimum acceptable price must be greater than 0'),
  harvestDate: z.string().min(1, 'Harvest date is required'),
  qualityGrade: z.enum(['GRADE_A', 'GRADE_B', 'GRADE_C']),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  location: z.string().min(2, 'Location is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  images: z.array(z.string()).optional(),
});

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'RESERVED', 'SOLD', 'EXPIRED', 'CANCELLED']).optional(),
});

export const marketplaceQuerySchema = z.object({
  crop: z.string().optional(),
  category: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  quality: z.string().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'quantity_desc', 'ai_recommended']).default('newest'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});
