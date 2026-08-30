"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WasteController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class WasteController {
    /**
     * Get all active crop residue and agricultural waste listings
     */
    static async getWasteListings(req, res) {
        try {
            const { wasteType, district, state, search } = req.query;
            const where = { status: 'ACTIVE' };
            if (wasteType && wasteType !== 'ALL') {
                where.wasteType = wasteType;
            }
            if (district && district !== 'ALL') {
                where.district = district;
            }
            if (state && state !== 'ALL') {
                where.state = state;
            }
            if (search) {
                where.OR = [
                    { title: { contains: search } },
                    { description: { contains: search } },
                    { suitableFor: { contains: search } },
                ];
            }
            const listings = await prisma_js_1.prisma.agriWasteListing.findMany({
                where,
                include: {
                    farmer: { select: { id: true, name: true, phone: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, listings, 'Agri waste listings retrieved');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to fetch waste listings', 500);
        }
    }
    /**
     * Create agri waste / crop residue listing
     */
    static async createWasteListing(req, res) {
        try {
            const farmerId = req.user.id;
            const { wasteType, title, description, quantityTons, pricePerTon, suitableFor, location, district, state, imageUrl } = req.body;
            const listing = await prisma_js_1.prisma.agriWasteListing.create({
                data: {
                    farmerId,
                    wasteType: wasteType || 'CROP_RESIDUE',
                    title,
                    description,
                    quantityTons: parseFloat(quantityTons) || 5.0,
                    availableTons: parseFloat(quantityTons) || 5.0,
                    pricePerTon: parseFloat(pricePerTon) || 0.0,
                    suitableFor: suitableFor || 'COMPOSTING, MULCHING',
                    location: location || 'Farmgate Location',
                    district: district || 'Coimbatore',
                    state: state || 'Tamil Nadu',
                    imageUrl,
                    status: 'ACTIVE',
                },
            });
            (0, response_js_1.sendSuccess)(res, listing, 'Agri waste listing published', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Buyer creates offer/request for agri waste
     */
    static async createOffer(req, res) {
        try {
            const buyerId = req.user.id;
            const { listingId, offeredPricePerTon, requestedTons, message } = req.body;
            const listing = await prisma_js_1.prisma.agriWasteListing.findUnique({
                where: { id: listingId },
            });
            if (!listing) {
                (0, response_js_1.sendError)(res, 'Listing not found', 404);
                return;
            }
            const tons = parseFloat(requestedTons) || 1.0;
            const price = parseFloat(offeredPricePerTon) || listing.pricePerTon;
            const totalAmount = tons * price;
            const offer = await prisma_js_1.prisma.wasteOffer.create({
                data: {
                    listingId,
                    buyerId,
                    offeredPricePerTon: price,
                    requestedTons: tons,
                    totalAmount,
                    message,
                    status: 'PENDING',
                },
                include: { listing: true },
            });
            (0, response_js_1.sendSuccess)(res, offer, 'Offer submitted to farmer', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Get farmer's waste listings
     */
    static async getMyWasteListings(req, res) {
        try {
            const farmerId = req.user.id;
            const listings = await prisma_js_1.prisma.agriWasteListing.findMany({
                where: { farmerId },
                include: { offers: { include: { buyer: { select: { id: true, name: true, phone: true } } } } },
                orderBy: { createdAt: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, listings);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
}
exports.WasteController = WasteController;
