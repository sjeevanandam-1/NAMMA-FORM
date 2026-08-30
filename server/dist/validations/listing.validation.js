"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketplaceQuerySchema = exports.updateListingSchema = exports.createListingSchema = void 0;
const zod_1 = require("zod");
exports.createListingSchema = zod_1.z.object({
    cropId: zod_1.z.string().uuid('Valid crop ID is required'),
    farmId: zod_1.z.string().uuid().optional(),
    variety: zod_1.z.string().min(1, 'Variety is required'),
    quantityKg: zod_1.z.number().positive('Quantity must be greater than 0'),
    unit: zod_1.z.string().default('KG'),
    expectedPricePerKg: zod_1.z.number().positive('Expected price must be greater than 0'),
    minAcceptablePrice: zod_1.z.number().positive('Minimum acceptable price must be greater than 0'),
    harvestDate: zod_1.z.string().min(1, 'Harvest date is required'),
    qualityGrade: zod_1.z.enum(['GRADE_A', 'GRADE_B', 'GRADE_C']),
    description: zod_1.z.string().min(5, 'Description must be at least 5 characters'),
    location: zod_1.z.string().min(2, 'Location is required'),
    district: zod_1.z.string().min(2, 'District is required'),
    state: zod_1.z.string().min(2, 'State is required'),
    images: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.updateListingSchema = exports.createListingSchema.partial().extend({
    status: zod_1.z.enum(['DRAFT', 'ACTIVE', 'RESERVED', 'SOLD', 'EXPIRED', 'CANCELLED']).optional(),
});
exports.marketplaceQuerySchema = zod_1.z.object({
    crop: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    district: zod_1.z.string().optional(),
    minPrice: zod_1.z.coerce.number().optional(),
    maxPrice: zod_1.z.coerce.number().optional(),
    quality: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['price_asc', 'price_desc', 'newest', 'quantity_desc', 'ai_recommended']).default('newest'),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(50).default(12),
});
