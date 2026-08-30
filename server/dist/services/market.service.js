"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketService = void 0;
const prisma_js_1 = require("../config/prisma.js");
class MarketService {
    /**
     * Fetches latest market prices with filters for state, district, crop name.
     */
    static async getLatestPrices(params) {
        const { cropName, state, district, limit = 50 } = params;
        const where = {};
        if (cropName) {
            where.cropName = { contains: cropName };
        }
        if (state) {
            where.state = state;
        }
        if (district) {
            where.district = district;
        }
        const prices = await prisma_js_1.prisma.marketPrice.findMany({
            where,
            orderBy: { recordDate: 'desc' },
            take: limit,
            include: {
                crop: true,
            },
        });
        return prices;
    }
    /**
     * Returns price history for a given crop over the last N days.
     */
    static async getPriceHistory(cropName, days = 30) {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - days);
        const history = await prisma_js_1.prisma.marketPrice.findMany({
            where: {
                cropName: { contains: cropName },
                recordDate: { gte: pastDate },
            },
            orderBy: { recordDate: 'asc' },
        });
        return history;
    }
    /**
     * Allows Admin to import verified datasets or seed verified Agmarknet data.
     */
    static async importMarketDataset(records) {
        const created = [];
        for (const item of records) {
            // Find matching crop if exists
            const crop = await prisma_js_1.prisma.crop.findFirst({
                where: { name: { contains: item.cropName } },
            });
            const entry = await prisma_js_1.prisma.marketPrice.create({
                data: {
                    cropId: crop?.id || null,
                    cropName: item.cropName,
                    marketName: item.marketName,
                    district: item.district,
                    state: item.state,
                    modalPrice: item.modalPrice,
                    minPrice: item.minPrice,
                    maxPrice: item.maxPrice,
                    unit: item.unit || 'KG',
                    recordDate: new Date(item.recordDate),
                    source: item.source || 'AGMARKNET',
                    sourceUrl: item.sourceUrl || null,
                    isDemoData: item.isDemoData || false,
                },
            });
            created.push(entry);
        }
        return created;
    }
}
exports.MarketService = MarketService;
