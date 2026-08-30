"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
const audit_service_js_1 = require("../services/audit.service.js");
class AdminController {
    /**
     * Get all users with roles and verification statuses
     */
    static async getAllUsers(req, res) {
        try {
            const { role, isVerified, page = '1', limit = '20' } = req.query;
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            const where = {};
            if (role)
                where.role = String(role);
            if (isVerified !== undefined)
                where.isVerified = isVerified === 'true';
            const [total, users] = await Promise.all([
                prisma_js_1.prisma.user.count({ where }),
                prisma_js_1.prisma.user.findMany({
                    where,
                    select: {
                        id: true,
                        email: true,
                        phone: true,
                        name: true,
                        role: true,
                        isVerified: true,
                        avatarUrl: true,
                        createdAt: true,
                        farmerProfile: true,
                        buyerProfile: true,
                        expertProfile: true,
                        govProfile: true,
                        trustScore: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    skip: (pageNum - 1) * limitNum,
                    take: limitNum,
                }),
            ]);
            (0, response_js_1.sendSuccess)(res, users, 'Users retrieved', 200, {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            });
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Verify/Approve user account (Farmer KYC, Buyer GST, or Expert accreditation)
     */
    static async verifyUser(req, res) {
        try {
            const { id } = req.params;
            const { isVerified } = req.body;
            const user = await prisma_js_1.prisma.user.update({
                where: { id },
                data: { isVerified: Boolean(isVerified) },
            });
            if (user.role === 'FARMER') {
                await prisma_js_1.prisma.farmerProfile.updateMany({
                    where: { userId: id },
                    data: { kycStatus: isVerified ? 'VERIFIED' : 'REJECTED' },
                });
            }
            else if (user.role === 'BUYER') {
                await prisma_js_1.prisma.buyerProfile.updateMany({
                    where: { userId: id },
                    data: { kycStatus: isVerified ? 'VERIFIED' : 'REJECTED' },
                });
            }
            else if (user.role === 'EXPERT') {
                await prisma_js_1.prisma.expertProfile.updateMany({
                    where: { userId: id },
                    data: { isVerified: Boolean(isVerified) },
                });
            }
            await audit_service_js_1.AuditService.log({
                userId: req.user.id,
                action: 'ADMIN_VERIFY_USER',
                entityType: 'USER',
                entityId: id,
                details: { targetUserId: id, isVerified },
            });
            (0, response_js_1.sendSuccess)(res, user, `User verification status updated to ${isVerified}`);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Comprehensive Platform Analytics across all 22 features
     */
    static async getPlatformStats(_req, res) {
        try {
            const [totalFarmers, totalBuyers, totalExperts, totalListings, totalOrders, completedOrders, totalSchemes, totalSchemeApplications, totalStorageCenters, totalEquipment, totalTransportVehicles, totalLoanProducts, totalLoanApplications, totalInsurancePolicies, totalInsuranceClaims, totalWasteListings, totalCommunityPosts, totalSupportTickets, totalDiseaseScans, totalAIConversations,] = await Promise.all([
                prisma_js_1.prisma.user.count({ where: { role: 'FARMER' } }),
                prisma_js_1.prisma.user.count({ where: { role: 'BUYER' } }),
                prisma_js_1.prisma.user.count({ where: { role: 'EXPERT' } }),
                prisma_js_1.prisma.cropListing.count(),
                prisma_js_1.prisma.order.count(),
                prisma_js_1.prisma.order.findMany({ where: { status: 'COMPLETED' } }),
                prisma_js_1.prisma.governmentScheme.count(),
                prisma_js_1.prisma.schemeApplication.count(),
                prisma_js_1.prisma.storageCenter.count(),
                prisma_js_1.prisma.equipment.count(),
                prisma_js_1.prisma.transportVehicle.count(),
                prisma_js_1.prisma.agriLoanProduct.count(),
                prisma_js_1.prisma.loanApplication.count(),
                prisma_js_1.prisma.insurancePolicy.count(),
                prisma_js_1.prisma.insuranceClaim.count(),
                prisma_js_1.prisma.agriWasteListing.count(),
                prisma_js_1.prisma.communityPost.count(),
                prisma_js_1.prisma.supportTicket.count(),
                prisma_js_1.prisma.diseaseScan.count(),
                prisma_js_1.prisma.aIConversation.count(),
            ]);
            const gmv = completedOrders.reduce((acc, order) => acc + order.grandTotal, 0);
            (0, response_js_1.sendSuccess)(res, {
                users: {
                    totalFarmers,
                    totalBuyers,
                    totalExperts,
                    totalUsers: totalFarmers + totalBuyers + totalExperts,
                },
                marketplace: {
                    totalListings,
                    totalOrders,
                    grossMerchandiseValue: gmv,
                    wasteListings: totalWasteListings,
                },
                schemesAndMSP: {
                    totalSchemes,
                    totalSchemeApplications,
                },
                logisticsAndStorage: {
                    totalStorageCenters,
                    totalEquipment,
                    totalTransportVehicles,
                },
                financialServices: {
                    totalLoanProducts,
                    totalLoanApplications,
                    totalInsurancePolicies,
                    totalInsuranceClaims,
                },
                aiAndDiagnostics: {
                    totalDiseaseScans,
                    totalAIConversations,
                },
                communityAndSupport: {
                    totalCommunityPosts,
                    totalSupportTickets,
                },
            });
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * View security & financial audit logs
     */
    static async getAuditLogs(req, res) {
        try {
            const { action, entityType, page = '1', limit = '50' } = req.query;
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            const where = {};
            if (action)
                where.action = String(action);
            if (entityType)
                where.entityType = String(entityType);
            const [total, logs] = await Promise.all([
                prisma_js_1.prisma.auditLog.count({ where }),
                prisma_js_1.prisma.auditLog.findMany({
                    where,
                    include: {
                        user: { select: { id: true, name: true, email: true, role: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip: (pageNum - 1) * limitNum,
                    take: limitNum,
                }),
            ]);
            (0, response_js_1.sendSuccess)(res, logs, 'Audit logs retrieved', 200, {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            });
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
}
exports.AdminController = AdminController;
