"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketController = void 0;
const response_js_1 = require("../utils/response.js");
const market_service_js_1 = require("../services/market.service.js");
const audit_service_js_1 = require("../services/audit.service.js");
class MarketController {
    /**
     * Get latest mandi market prices
     */
    static async getPrices(req, res) {
        try {
            const cropName = req.query.crop;
            const state = req.query.state;
            const district = req.query.district;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
            const prices = await market_service_js_1.MarketService.getLatestPrices({
                cropName,
                state,
                district,
                limit,
            });
            (0, response_js_1.sendSuccess)(res, prices);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Get price history for a crop
     */
    static async getPriceHistory(req, res) {
        try {
            const cropName = req.query.crop || 'Tomato';
            const days = req.query.days ? parseInt(req.query.days, 10) : 30;
            const history = await market_service_js_1.MarketService.getPriceHistory(cropName, days);
            (0, response_js_1.sendSuccess)(res, history);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Admin: Import verified market price dataset
     */
    static async importDataset(req, res) {
        try {
            const { records } = req.body;
            if (!Array.isArray(records) || records.length === 0) {
                (0, response_js_1.sendError)(res, 'Array of market price records is required', 400);
                return;
            }
            const imported = await market_service_js_1.MarketService.importMarketDataset(records);
            await audit_service_js_1.AuditService.log({
                userId: req.user?.id,
                action: 'MARKET_IMPORT',
                entityType: 'MARKET_PRICE',
                details: { count: imported.length },
            });
            (0, response_js_1.sendSuccess)(res, imported, `Successfully imported ${imported.length} market records`, 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
}
exports.MarketController = MarketController;
