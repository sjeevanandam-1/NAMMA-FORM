"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
const listing_validation_js_1 = require("../validations/listing.validation.js");
const audit_service_js_1 = require("../services/audit.service.js");
class ListingController {
    /**
     * Get farmer's own listings
     */
    static async getMyListings(req, res) {
        try {
            const listings = await prisma_js_1.prisma.cropListing.findMany({
                where: { farmerId: req.user.id },
                include: {
                    crop: true,
                    farm: true,
                    images: true,
                    orders: {
                        select: { id: true, status: true, grandTotal: true, quantityKg: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, listings);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Create a new crop listing with image attachments
     */
    static async createListing(req, res) {
        try {
            const data = listing_validation_js_1.createListingSchema.parse(req.body);
            const listing = await prisma_js_1.prisma.cropListing.create({
                data: {
                    farmerId: req.user.id,
                    farmId: data.farmId || null,
                    cropId: data.cropId,
                    variety: data.variety,
                    quantityKg: data.quantityKg,
                    availableQuantityKg: data.quantityKg,
                    unit: data.unit || 'KG',
                    expectedPricePerKg: data.expectedPricePerKg,
                    minAcceptablePrice: data.minAcceptablePrice,
                    harvestDate: new Date(data.harvestDate),
                    qualityGrade: data.qualityGrade,
                    description: data.description,
                    location: data.location,
                    district: data.district,
                    state: data.state,
                    status: 'ACTIVE',
                    images: data.images && data.images.length > 0
                        ? {
                            create: data.images.map((url, idx) => ({
                                url,
                                filename: `img-${idx}`,
                                isPrimary: idx === 0,
                            })),
                        }
                        : undefined,
                },
                include: {
                    crop: true,
                    images: true,
                },
            });
            await audit_service_js_1.AuditService.log({
                userId: req.user.id,
                action: 'CREATE_LISTING',
                entityType: 'LISTING',
                entityId: listing.id,
                details: { cropId: data.cropId, quantity: data.quantityKg, price: data.expectedPricePerKg },
            });
            (0, response_js_1.sendSuccess)(res, listing, 'Crop listed on marketplace successfully', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Update crop listing (Owner only)
     */
    static async updateListing(req, res) {
        try {
            const { id } = req.params;
            const data = listing_validation_js_1.updateListingSchema.parse(req.body);
            const existing = await prisma_js_1.prisma.cropListing.findUnique({
                where: { id },
            });
            if (!existing) {
                (0, response_js_1.sendError)(res, 'Listing not found', 404);
                return;
            }
            if (existing.farmerId !== req.user.id && req.user.role !== 'ADMIN') {
                (0, response_js_1.sendError)(res, 'Unauthorized - You can only edit your own listings', 403);
                return;
            }
            const updated = await prisma_js_1.prisma.cropListing.update({
                where: { id },
                data: {
                    farmId: data.farmId !== undefined ? data.farmId : existing.farmId,
                    variety: data.variety || existing.variety,
                    quantityKg: data.quantityKg || existing.quantityKg,
                    availableQuantityKg: data.quantityKg || existing.availableQuantityKg,
                    unit: data.unit || existing.unit,
                    expectedPricePerKg: data.expectedPricePerKg || existing.expectedPricePerKg,
                    minAcceptablePrice: data.minAcceptablePrice || existing.minAcceptablePrice,
                    harvestDate: data.harvestDate ? new Date(data.harvestDate) : existing.harvestDate,
                    qualityGrade: data.qualityGrade || existing.qualityGrade,
                    description: data.description || existing.description,
                    location: data.location || existing.location,
                    district: data.district || existing.district,
                    state: data.state || existing.state,
                    status: data.status || existing.status,
                },
                include: {
                    crop: true,
                    images: true,
                },
            });
            await audit_service_js_1.AuditService.log({
                userId: req.user.id,
                action: 'UPDATE_LISTING',
                entityType: 'LISTING',
                entityId: updated.id,
                details: { status: updated.status, price: updated.expectedPricePerKg },
            });
            (0, response_js_1.sendSuccess)(res, updated, 'Listing updated successfully');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Delete listing (Owner or Admin)
     */
    static async deleteListing(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_js_1.prisma.cropListing.findUnique({
                where: { id },
            });
            if (!existing) {
                (0, response_js_1.sendError)(res, 'Listing not found', 404);
                return;
            }
            if (existing.farmerId !== req.user.id && req.user.role !== 'ADMIN') {
                (0, response_js_1.sendError)(res, 'Unauthorized to delete this listing', 403);
                return;
            }
            await prisma_js_1.prisma.cropListing.delete({ where: { id } });
            (0, response_js_1.sendSuccess)(res, null, 'Listing deleted successfully');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
}
exports.ListingController = ListingController;
