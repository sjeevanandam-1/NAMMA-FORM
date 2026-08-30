"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CropController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class CropController {
    /**
     * Get all master crops catalog
     */
    static async getAllCrops(req, res) {
        try {
            const { category } = req.query;
            const where = category ? { category: String(category) } : {};
            const crops = await prisma_js_1.prisma.crop.findMany({
                where,
                orderBy: { name: 'asc' },
            });
            (0, response_js_1.sendSuccess)(res, crops);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Get crop by ID with latest market prices and predictions
     */
    static async getCropById(req, res) {
        try {
            const { id } = req.params;
            const crop = await prisma_js_1.prisma.crop.findUnique({
                where: { id },
                include: {
                    marketPrices: {
                        orderBy: { recordDate: 'desc' },
                        take: 10,
                    },
                    predictions: {
                        orderBy: { calculatedAt: 'desc' },
                        take: 1,
                    },
                },
            });
            if (!crop) {
                (0, response_js_1.sendError)(res, 'Crop not found', 404);
                return;
            }
            (0, response_js_1.sendSuccess)(res, crop);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Admin: Add new crop to master catalog
     */
    static async createCrop(req, res) {
        try {
            const { name, category, variety, description, season, idealSoil, gestationPeriodDays, imageUrl } = req.body;
            const crop = await prisma_js_1.prisma.crop.create({
                data: {
                    name,
                    category,
                    variety: variety || null,
                    description,
                    season,
                    idealSoil,
                    gestationPeriodDays: parseInt(gestationPeriodDays, 10),
                    imageUrl: imageUrl || null,
                },
            });
            (0, response_js_1.sendSuccess)(res, crop, 'Crop added to catalog', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
}
exports.CropController = CropController;
