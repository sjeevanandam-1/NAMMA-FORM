"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassportController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class PassportController {
    /**
     * Get aggregated Digital Farmer Passport
     */
    static async getFarmerPassport(req, res) {
        try {
            const farmerId = req.user.id;
            // 1. Fetch user + farmer profile + farm
            const user = await prisma_js_1.prisma.user.findUnique({
                where: { id: farmerId },
                include: {
                    farmerProfile: { include: { farms: true } },
                    trustScore: true,
                    farmerPassport: true,
                },
            });
            if (!user) {
                (0, response_js_1.sendError)(res, 'Farmer not found', 404);
                return;
            }
            // 2. Fetch sales & transactions summary
            const completedOrders = await prisma_js_1.prisma.order.findMany({
                where: { farmerId, status: { in: ['COMPLETED', 'DELIVERED'] } },
            });
            const totalSales = completedOrders.reduce((sum, o) => sum + o.grandTotal, 0);
            // 3. Fetch active schemes
            const schemeApps = await prisma_js_1.prisma.schemeApplication.findMany({
                where: { farmerId },
                include: { scheme: true },
            });
            // 4. Fetch active loans
            const loanApps = await prisma_js_1.prisma.loanApplication.findMany({
                where: { farmerId },
                include: { loanProduct: true },
            });
            // 5. Fetch insurance policies
            const policies = await prisma_js_1.prisma.insurancePolicy.findMany({
                where: { farmerId },
                include: { product: true },
            });
            // 6. Fetch crop health scans
            const healthScans = await prisma_js_1.prisma.diseaseScan.findMany({
                where: { farmerId },
                include: { recommendation: true },
                take: 5,
                orderBy: { createdAt: 'desc' },
            });
            // 7. Active listings
            const listings = await prisma_js_1.prisma.cropListing.findMany({
                where: { farmerId },
                include: { crop: true },
            });
            const passportNumber = user.farmerPassport?.passportNumber || `NF-TN-2026-${farmerId.slice(-4).toUpperCase()}`;
            const fullPassport = {
                passportNumber,
                farmer: {
                    id: user.id,
                    name: user.name,
                    phone: user.phone,
                    email: user.email,
                    avatarUrl: user.avatarUrl,
                    kycStatus: user.farmerProfile?.kycStatus || 'VERIFIED',
                    joinedDate: user.createdAt,
                },
                farmDetails: {
                    state: user.farmerProfile?.state || 'Tamil Nadu',
                    district: user.farmerProfile?.district || 'Coimbatore',
                    village: user.farmerProfile?.village || 'Kinathukadavu',
                    location: user.farmerProfile?.farmLocation || 'SF No. 142/2',
                    totalLandAreaAcre: user.farmerProfile?.landAreaAcre || 5.5,
                    soilType: user.farmerProfile?.soilType || 'Red Loam',
                    irrigationType: user.farmerProfile?.irrigationType || 'Borewell + Micro-Drip',
                    mainCrops: user.farmerProfile?.mainCrops || 'Tomato, Banana, Green Chilli',
                },
                soilHealth: {
                    soilHealthIndex: user.farmerPassport?.soilHealthIndex || 8.7,
                    soilNPKStatus: user.farmerPassport?.soilNPKStatus || 'Nitrogen: Medium | Phosphorus: High | Potassium: Optimal | pH: 6.8',
                    organicCarbonPct: '0.68% (Healthy)',
                    ecValue: '0.42 dS/m (Normal)',
                },
                creditAndTrust: {
                    trustScore: user.trustScore?.score || 92.0,
                    creditRatingGrade: user.farmerPassport?.creditRatingGrade || 'A+ (High Creditworthiness)',
                    totalLifetimeSales: totalSales || user.farmerPassport?.totalLifetimeSales || 485000,
                    totalTransactions: completedOrders.length || user.farmerPassport?.totalTransactions || 18,
                    onTimeDeliveryRate: '98.5%',
                },
                governmentSchemes: schemeApps,
                activeLoans: loanApps,
                insuranceCoverage: policies,
                recentCropHealthScans: healthScans,
                activeCropListings: listings,
                qrCodePayload: `https://nammafarm.in/verify/passport/${passportNumber}`,
            };
            (0, response_js_1.sendSuccess)(res, fullPassport, 'Digital Farmer Passport retrieved');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to generate farmer passport', 500);
        }
    }
}
exports.PassportController = PassportController;
