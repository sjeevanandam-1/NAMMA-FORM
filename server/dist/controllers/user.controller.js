"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class UserController {
    /**
     * Update current user profile
     */
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { name, phone, avatarUrl, farmerProfile, buyerProfile } = req.body;
            const updatedUser = await prisma_js_1.prisma.user.update({
                where: { id: userId },
                data: {
                    name: name || undefined,
                    phone: phone || undefined,
                    avatarUrl: avatarUrl || (req.file ? `/uploads/${req.file.filename}` : undefined),
                },
            });
            if (req.user.role === 'FARMER' && farmerProfile) {
                await prisma_js_1.prisma.farmerProfile.updateMany({
                    where: { userId },
                    data: {
                        state: farmerProfile.state,
                        district: farmerProfile.district,
                        village: farmerProfile.village,
                        farmLocation: farmerProfile.farmLocation,
                        soilType: farmerProfile.soilType,
                        irrigationType: farmerProfile.irrigationType,
                        mainCrops: Array.isArray(farmerProfile.mainCrops)
                            ? JSON.stringify(farmerProfile.mainCrops)
                            : farmerProfile.mainCrops,
                    },
                });
            }
            else if (req.user.role === 'BUYER' && buyerProfile) {
                await prisma_js_1.prisma.buyerProfile.updateMany({
                    where: { userId },
                    data: {
                        companyName: buyerProfile.companyName,
                        businessType: buyerProfile.businessType,
                        gstNumber: buyerProfile.gstNumber,
                        state: buyerProfile.state,
                        district: buyerProfile.district,
                        location: buyerProfile.location,
                        requiredCrops: Array.isArray(buyerProfile.requiredCrops)
                            ? JSON.stringify(buyerProfile.requiredCrops)
                            : buyerProfile.requiredCrops,
                    },
                });
            }
            (0, response_js_1.sendSuccess)(res, updatedUser, 'Profile updated successfully');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Get public profile with trust score and reviews
     */
    static async getPublicProfile(req, res) {
        try {
            const { id } = req.params;
            const user = await prisma_js_1.prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    role: true,
                    isVerified: true,
                    avatarUrl: true,
                    farmerProfile: {
                        select: {
                            state: true,
                            district: true,
                            village: true,
                            landAreaAcre: true,
                            soilType: true,
                            irrigationType: true,
                            mainCrops: true,
                            kycStatus: true,
                        },
                    },
                    buyerProfile: {
                        select: {
                            companyName: true,
                            businessType: true,
                            state: true,
                            district: true,
                            location: true,
                            requiredCrops: true,
                            kycStatus: true,
                        },
                    },
                    trustScore: true,
                    reviewsReceived: {
                        include: {
                            reviewer: { select: { id: true, name: true, role: true } },
                        },
                        take: 10,
                        orderBy: { createdAt: 'desc' },
                    },
                },
            });
            if (!user) {
                (0, response_js_1.sendError)(res, 'User not found', 404);
                return;
            }
            (0, response_js_1.sendSuccess)(res, user);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
}
exports.UserController = UserController;
