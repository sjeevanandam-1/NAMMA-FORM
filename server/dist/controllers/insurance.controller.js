"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsuranceController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class InsuranceController {
    /**
     * Get all crop insurance schemes (PMFBY, WBCIS)
     */
    static async getInsuranceProducts(_req, res) {
        try {
            const products = await prisma_js_1.prisma.insuranceProduct.findMany({
                where: { isActive: true },
                orderBy: { cutOffDate: 'asc' },
            });
            (0, response_js_1.sendSuccess)(res, products, 'Crop insurance schemes retrieved');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to fetch insurance products', 500);
        }
    }
    /**
     * Calculate premium and coverage
     */
    static async calculatePremium(req, res) {
        try {
            const { cropCategory = 'VEGETABLES', landAreaAcre = 2.0, scaleOfFinancePerAcre = 40000 } = req.body;
            const area = parseFloat(landAreaAcre) || 1.0;
            const sumInsured = area * (parseFloat(scaleOfFinancePerAcre) || 40000);
            // Standard PMFBY premium slabs
            let farmerSharePct = 2.0; // Kharif
            if (cropCategory === 'RABI' || cropCategory === 'GRAINS')
                farmerSharePct = 1.5;
            else if (cropCategory === 'HORTICULTURE' || cropCategory === 'COMMERCIAL')
                farmerSharePct = 5.0;
            const farmerPremium = (sumInsured * farmerSharePct) / 100;
            const totalActuarialPremium = (sumInsured * 12.0) / 100;
            const govtSubsidy = totalActuarialPremium - farmerPremium;
            (0, response_js_1.sendSuccess)(res, {
                landAreaAcre: area,
                sumInsured,
                farmerSharePct,
                farmerPremiumToPay: Math.round(farmerPremium),
                govtSubsidyAmount: Math.round(govtSubsidy),
                totalActuarialPremium: Math.round(totalActuarialPremium),
            });
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Enroll in crop insurance policy
     */
    static async enrollPolicy(req, res) {
        try {
            const farmerId = req.user.id;
            const { productId, cropName, season, landAreaAcre, sumInsured, farmerPremiumPaid, govtSubsidyAmount, village, district, state, surveyNumber, } = req.body;
            const policyNumber = `POL-PMFBY-${Date.now().toString().slice(-6)}`;
            const policy = await prisma_js_1.prisma.insurancePolicy.create({
                data: {
                    policyNumber,
                    productId,
                    farmerId,
                    cropName: cropName || 'Tomato',
                    season: season || 'KHARIF',
                    year: '2026',
                    landAreaAcre: parseFloat(landAreaAcre) || 1.0,
                    sumInsured: parseFloat(sumInsured) || 50000,
                    farmerPremiumPaid: parseFloat(farmerPremiumPaid) || 1000,
                    govtSubsidyAmount: parseFloat(govtSubsidyAmount) || 4000,
                    village: village || 'Local Village',
                    district: district || 'Coimbatore',
                    state: state || 'Tamil Nadu',
                    surveyNumber: surveyNumber || '142/1',
                    status: 'ACTIVE',
                },
                include: { product: true },
            });
            (0, response_js_1.sendSuccess)(res, policy, 'Crop insurance policy issued successfully', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * File crop loss insurance claim
     */
    static async fileClaim(req, res) {
        try {
            const farmerId = req.user.id;
            const { policyId, lossCause, lossDate, estimatedLossPct, claimedAmount, damagePhotoUrl, lossDescription } = req.body;
            const claimNumber = `CLM-${Date.now().toString().slice(-6)}`;
            const claim = await prisma_js_1.prisma.insuranceClaim.create({
                data: {
                    claimNumber,
                    policyId,
                    farmerId,
                    lossCause: lossCause || 'UNSEASONAL_RAINFALL',
                    lossDate: new Date(lossDate || Date.now()),
                    estimatedLossPct: parseFloat(estimatedLossPct) || 50.0,
                    claimedAmount: parseFloat(claimedAmount) || 25000,
                    damagePhotoUrl,
                    lossDescription,
                    status: 'FILED',
                },
                include: { policy: true },
            });
            // Update policy status
            await prisma_js_1.prisma.insurancePolicy.update({
                where: { id: policyId },
                data: { status: 'CLAIM_IN_PROGRESS' },
            });
            (0, response_js_1.sendSuccess)(res, claim, 'Crop insurance claim filed successfully. Digital surveyor assigned within 48h.', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Get farmer's active policies and claims
     */
    static async getMyPolicies(req, res) {
        try {
            const farmerId = req.user.id;
            const policies = await prisma_js_1.prisma.insurancePolicy.findMany({
                where: { farmerId },
                include: { product: true, claims: true },
                orderBy: { createdAt: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, policies);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
}
exports.InsuranceController = InsuranceController;
