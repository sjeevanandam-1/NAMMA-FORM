"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FarmController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
const farm_validation_js_1 = require("../validations/farm.validation.js");
class FarmController {
    /**
     * Get all farms belonging to logged-in farmer
     */
    static async getMyFarms(req, res) {
        try {
            const profile = await prisma_js_1.prisma.farmerProfile.findUnique({
                where: { userId: req.user.id },
            });
            if (!profile) {
                (0, response_js_1.sendError)(res, 'Farmer profile not found', 404);
                return;
            }
            const farms = await prisma_js_1.prisma.farm.findMany({
                where: { farmerProfileId: profile.id },
                include: {
                    listings: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, farms);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Create a new farm
     */
    static async createFarm(req, res) {
        try {
            const data = farm_validation_js_1.createFarmSchema.parse(req.body);
            const profile = await prisma_js_1.prisma.farmerProfile.findUnique({
                where: { userId: req.user.id },
            });
            if (!profile) {
                (0, response_js_1.sendError)(res, 'Farmer profile not found', 404);
                return;
            }
            const cropsString = Array.isArray(data.crops) ? JSON.stringify(data.crops) : data.crops;
            const farm = await prisma_js_1.prisma.farm.create({
                data: {
                    farmerProfileId: profile.id,
                    farmName: data.farmName,
                    location: data.location,
                    latitude: data.latitude || null,
                    longitude: data.longitude || null,
                    landAreaAcre: data.landAreaAcre,
                    soilType: data.soilType,
                    irrigation: data.irrigation,
                    crops: cropsString,
                },
            });
            (0, response_js_1.sendSuccess)(res, farm, 'Farm registered successfully', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Update farm
     */
    static async updateFarm(req, res) {
        try {
            const { id } = req.params;
            const data = farm_validation_js_1.updateFarmSchema.parse(req.body);
            const farm = await prisma_js_1.prisma.farm.findUnique({
                where: { id },
                include: { farmerProfile: true },
            });
            if (!farm || farm.farmerProfile.userId !== req.user.id) {
                (0, response_js_1.sendError)(res, 'Farm not found or unauthorized', 403);
                return;
            }
            const updated = await prisma_js_1.prisma.farm.update({
                where: { id },
                data: {
                    ...data,
                    crops: data.crops
                        ? Array.isArray(data.crops)
                            ? JSON.stringify(data.crops)
                            : data.crops
                        : undefined,
                },
            });
            (0, response_js_1.sendSuccess)(res, updated, 'Farm updated successfully');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Delete farm
     */
    static async deleteFarm(req, res) {
        try {
            const { id } = req.params;
            const farm = await prisma_js_1.prisma.farm.findUnique({
                where: { id },
                include: { farmerProfile: true },
            });
            if (!farm || farm.farmerProfile.userId !== req.user.id) {
                (0, response_js_1.sendError)(res, 'Farm not found or unauthorized', 403);
                return;
            }
            await prisma_js_1.prisma.farm.delete({ where: { id } });
            (0, response_js_1.sendSuccess)(res, null, 'Farm deleted successfully');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
}
exports.FarmController = FarmController;
