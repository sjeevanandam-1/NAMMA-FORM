"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MSPController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class MSPController {
    /**
     * Get all MSP crop prices
     */
    static async getMSPPrices(req, res) {
        try {
            const { season, search } = req.query;
            const where = { isActive: true };
            if (season && season !== 'ALL') {
                where.season = season;
            }
            if (search) {
                where.cropName = { contains: search };
            }
            const mspList = await prisma_js_1.prisma.mSPPrice.findMany({
                where,
                orderBy: { mspPerQuintal: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, mspList, 'MSP price list retrieved');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to fetch MSP prices', 500);
        }
    }
    /**
     * Get nearby government procurement centres
     */
    static async getProcurementCenters(req, res) {
        try {
            const { district, state } = req.query;
            const where = { isOpen: true };
            if (district && district !== 'ALL') {
                where.district = district;
            }
            if (state && state !== 'ALL') {
                where.state = state;
            }
            const centers = await prisma_js_1.prisma.procurementCenter.findMany({
                where,
                orderBy: { centerName: 'asc' },
            });
            (0, response_js_1.sendSuccess)(res, centers, 'Procurement centers retrieved');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to fetch procurement centers', 500);
        }
    }
    /**
     * Book procurement slot at government center
     */
    static async bookProcurementSlot(req, res) {
        try {
            const farmerId = req.user.id;
            const { centerId, cropName, quantityQuintals, slotDate } = req.body;
            const center = await prisma_js_1.prisma.procurementCenter.findUnique({
                where: { id: centerId },
            });
            if (!center) {
                (0, response_js_1.sendError)(res, 'Procurement center not found', 404);
                return;
            }
            const mspRecord = await prisma_js_1.prisma.mSPPrice.findFirst({
                where: { cropName: { contains: cropName } },
            });
            const mspRate = mspRecord?.mspPerQuintal || 2300.0;
            const totalPayout = (parseFloat(quantityQuintals) || 10) * mspRate;
            const receiptNumber = `MSP-REC-${Date.now().toString().slice(-6)}`;
            const booking = await prisma_js_1.prisma.procurementBooking.create({
                data: {
                    farmerId,
                    centerId,
                    receiptNumber,
                    cropName,
                    quantityQuintals: parseFloat(quantityQuintals) || 10,
                    mspRatePerQuintal: mspRate,
                    totalMspPayout: totalPayout,
                    slotDate: new Date(slotDate || Date.now()),
                    status: 'SCHEDULED',
                    qualityGrade: 'FAQ (Fair Average Quality)',
                },
                include: { center: true },
            });
            (0, response_js_1.sendSuccess)(res, booking, 'Procurement slot booked successfully', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Get farmer's procurement history & digital receipts
     */
    static async getMyProcurementHistory(req, res) {
        try {
            const farmerId = req.user.id;
            const bookings = await prisma_js_1.prisma.procurementBooking.findMany({
                where: { farmerId },
                include: { center: true },
                orderBy: { createdAt: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, bookings);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Compare Live Market Prices vs MSP Assured Prices
     */
    static async getMarketVsMSPComparison(_req, res) {
        try {
            const mspPrices = await prisma_js_1.prisma.mSPPrice.findMany({ where: { isActive: true } });
            const marketPrices = await prisma_js_1.prisma.marketPrice.findMany({
                take: 30,
                orderBy: { recordDate: 'desc' },
            });
            const comparison = mspPrices.map((msp) => {
                const matchingMarket = marketPrices.find((m) => m.cropName.toLowerCase().includes(msp.cropName.toLowerCase()) ||
                    msp.cropName.toLowerCase().includes(m.cropName.toLowerCase()));
                const marketPricePerQuintal = matchingMarket ? matchingMarket.modalPrice * 100 : msp.mspPerQuintal * 0.94;
                const diff = marketPricePerQuintal - msp.mspPerQuintal;
                const diffPct = Math.round((diff / msp.mspPerQuintal) * 1000) / 10;
                return {
                    cropName: msp.cropName,
                    season: msp.season,
                    year: msp.year,
                    mspPerQuintal: msp.mspPerQuintal,
                    mspPerKg: msp.mspPerKg,
                    marketPricePerQuintal,
                    marketPricePerKg: Math.round((marketPricePerQuintal / 100) * 10) / 10,
                    differencePerQuintal: Math.round(diff),
                    diffPercentage: diffPct,
                    recommendation: diff >= 0
                        ? 'Market offering premium over MSP. Recommended: Sell in Direct Marketplace.'
                        : 'Market price below MSP. Recommended: Deliver to FCI / TNCSC Procurement Center.',
                };
            });
            (0, response_js_1.sendSuccess)(res, comparison, 'Market vs MSP comparison calculated');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
}
exports.MSPController = MSPController;
