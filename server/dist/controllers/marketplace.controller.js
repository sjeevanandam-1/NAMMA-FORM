"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
const listing_validation_js_1 = require("../validations/listing.validation.js");
class MarketplaceController {
    /**
     * Search and filter marketplace listings with backend pagination
     */
    static async getMarketplaceListings(req, res) {
        try {
            const query = listing_validation_js_1.marketplaceQuerySchema.parse(req.query);
            const { crop, category, state, district, minPrice, maxPrice, quality, sortBy, page, limit } = query;
            const where = {
                status: 'ACTIVE',
                availableQuantityKg: { gt: 0 },
            };
            if (crop) {
                where.OR = [
                    { crop: { name: { contains: crop } } },
                    { variety: { contains: crop } },
                    { description: { contains: crop } },
                ];
            }
            if (category) {
                where.crop = { category };
            }
            if (state) {
                where.state = state;
            }
            if (district) {
                where.district = district;
            }
            if (quality) {
                where.qualityGrade = quality;
            }
            if (minPrice !== undefined || maxPrice !== undefined) {
                const priceFilter = {};
                if (minPrice !== undefined)
                    priceFilter.gte = minPrice;
                if (maxPrice !== undefined)
                    priceFilter.lte = maxPrice;
                where.expectedPricePerKg = priceFilter;
            }
            // Sorting strategy
            let orderBy = { createdAt: 'desc' };
            if (sortBy === 'price_asc') {
                orderBy = { expectedPricePerKg: 'asc' };
            }
            else if (sortBy === 'price_desc') {
                orderBy = { expectedPricePerKg: 'desc' };
            }
            else if (sortBy === 'quantity_desc') {
                orderBy = { availableQuantityKg: 'desc' };
            }
            const skip = (page - 1) * limit;
            const [total, listings] = await Promise.all([
                prisma_js_1.prisma.cropListing.count({ where }),
                prisma_js_1.prisma.cropListing.findMany({
                    where,
                    include: {
                        crop: true,
                        images: true,
                        farmer: {
                            select: {
                                id: true,
                                name: true,
                                isVerified: true,
                                avatarUrl: true,
                                trustScore: true,
                                farmerProfile: {
                                    select: {
                                        state: true,
                                        district: true,
                                        village: true,
                                        soilType: true,
                                        irrigationType: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy,
                    skip,
                    take: limit,
                }),
            ]);
            const totalPages = Math.ceil(total / limit);
            (0, response_js_1.sendSuccess)(res, listings, 'Marketplace listings retrieved', 200, {
                page,
                limit,
                total,
                totalPages,
            });
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Get single listing detail with farmer verification & trust score
     */
    static async getListingDetail(req, res) {
        try {
            const { id } = req.params;
            const listing = await prisma_js_1.prisma.cropListing.findUnique({
                where: { id },
                include: {
                    crop: true,
                    farm: true,
                    images: true,
                    farmer: {
                        select: {
                            id: true,
                            name: true,
                            isVerified: true,
                            avatarUrl: true,
                            trustScore: true,
                            farmerProfile: {
                                select: {
                                    state: true,
                                    district: true,
                                    village: true,
                                    farmLocation: true,
                                    soilType: true,
                                    irrigationType: true,
                                    kycStatus: true,
                                },
                            },
                            reviewsReceived: {
                                include: {
                                    reviewer: {
                                        select: { name: true, role: true },
                                    },
                                },
                                take: 5,
                                orderBy: { createdAt: 'desc' },
                            },
                        },
                    },
                },
            });
            if (!listing) {
                (0, response_js_1.sendError)(res, 'Listing not found', 404);
                return;
            }
            (0, response_js_1.sendSuccess)(res, listing);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
}
exports.MarketplaceController = MarketplaceController;
