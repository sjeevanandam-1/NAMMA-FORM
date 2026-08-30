"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemeController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class SchemeController {
    /**
     * Get all government schemes with filtering by category, search, and state/level
     */
    static async getSchemes(req, res) {
        try {
            const { category, level, state, search } = req.query;
            const where = { isActive: true };
            if (category && category !== 'ALL') {
                where.category = category;
            }
            if (level && level !== 'ALL') {
                where.level = level;
            }
            if (state && state !== 'ALL') {
                where.OR = [{ state: state }, { level: 'CENTRAL' }];
            }
            if (search) {
                where.OR = [
                    { title: { contains: search } },
                    { code: { contains: search } },
                    { description: { contains: search } },
                    { benefits: { contains: search } },
                ];
            }
            const schemes = await prisma_js_1.prisma.governmentScheme.findMany({
                where,
                orderBy: { createdAt: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, schemes, 'Government schemes retrieved');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to fetch government schemes', 500);
        }
    }
    /**
     * Get single scheme details
     */
    static async getSchemeById(req, res) {
        try {
            const { id } = req.params;
            const scheme = await prisma_js_1.prisma.governmentScheme.findUnique({
                where: { id },
            });
            if (!scheme) {
                (0, response_js_1.sendError)(res, 'Government scheme not found', 404);
                return;
            }
            (0, response_js_1.sendSuccess)(res, scheme);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Check eligibility for a farmer
     */
    static async checkEligibility(req, res) {
        try {
            const { schemeId, landAreaAcre, annualIncome, cropType, isSmallFarmer } = req.body;
            const scheme = await prisma_js_1.prisma.governmentScheme.findUnique({
                where: { id: schemeId },
            });
            if (!scheme) {
                (0, response_js_1.sendError)(res, 'Scheme not found', 404);
                return;
            }
            let isEligible = true;
            const reasons = [];
            if (scheme.category === 'FINANCIAL_SUPPORT' || scheme.code === 'PM-KISAN') {
                if (landAreaAcre > 0) {
                    reasons.push('Valid cultivable landholding verified.');
                }
                else {
                    isEligible = false;
                    reasons.push('Requires registered cultivable landholding.');
                }
            }
            if (scheme.code === 'PMKSY-DRIP') {
                if (landAreaAcre <= 5) {
                    reasons.push('Eligible for 100% full micro-irrigation subsidy as Small/Marginal Farmer.');
                }
                else {
                    reasons.push('Eligible for 75% micro-irrigation subsidy as Other Farmer.');
                }
            }
            if (scheme.category === 'FARM_MACHINERY') {
                reasons.push('Eligible for 40%-50% capital subsidy on tractor/rotavator purchases.');
            }
            (0, response_js_1.sendSuccess)(res, {
                isEligible,
                reasons,
                schemeCode: scheme.code,
                estimatedSubsidy: scheme.maxAmount || 0,
                subsidyPct: scheme.subsidyPct || 50,
            });
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Submit scheme application
     */
    static async submitApplication(req, res) {
        try {
            const farmerId = req.user.id;
            const { schemeId, applicantName, applicantPhone, landAreaAcre, aadhaarLast4, bankAccountNumber, ifscCode, village, district, state, documentsSubmitted, } = req.body;
            const appNumber = `SCH-APP-${Date.now().toString().slice(-6)}`;
            const application = await prisma_js_1.prisma.schemeApplication.create({
                data: {
                    schemeId,
                    farmerId,
                    applicationNumber: appNumber,
                    applicantName: applicantName || req.user.name,
                    applicantPhone: applicantPhone || '9876543210',
                    landAreaAcre: parseFloat(landAreaAcre) || 1.0,
                    aadhaarLast4: aadhaarLast4 || '0000',
                    bankAccountNumber: bankAccountNumber || 'XXXX0000',
                    ifscCode: ifscCode || 'SBIN0001',
                    village: village || 'Local Village',
                    district: district || 'Coimbatore',
                    state: state || 'Tamil Nadu',
                    documentsSubmitted: JSON.stringify(documentsSubmitted || ['patta.pdf', 'aadhaar.pdf']),
                    status: 'SUBMITTED',
                },
                include: { scheme: true },
            });
            (0, response_js_1.sendSuccess)(res, application, 'Scheme application submitted successfully', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Get farmer's submitted applications
     */
    static async getMyApplications(req, res) {
        try {
            const farmerId = req.user.id;
            const applications = await prisma_js_1.prisma.schemeApplication.findMany({
                where: { farmerId },
                include: { scheme: true },
                orderBy: { createdAt: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, applications);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Save/Bookmark scheme
     */
    static async toggleSaveScheme(req, res) {
        try {
            const userId = req.user.id;
            const { schemeId } = req.body;
            const existing = await prisma_js_1.prisma.savedScheme.findUnique({
                where: { userId_schemeId: { userId, schemeId } },
            });
            if (existing) {
                await prisma_js_1.prisma.savedScheme.delete({
                    where: { id: existing.id },
                });
                (0, response_js_1.sendSuccess)(res, { saved: false }, 'Scheme removed from saved list');
            }
            else {
                await prisma_js_1.prisma.savedScheme.create({
                    data: { userId, schemeId },
                });
                (0, response_js_1.sendSuccess)(res, { saved: true }, 'Scheme saved to your bookmarks');
            }
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
}
exports.SchemeController = SchemeController;
