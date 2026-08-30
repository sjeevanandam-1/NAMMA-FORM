import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.js';
import { MarketService } from '../services/market.service.js';
import { AuditService } from '../services/audit.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class MarketController {
  /**
   * Get latest mandi market prices
   */
  static async getPrices(req: Request, res: Response): Promise<void> {
    try {
      const cropName = req.query.crop as string;
      const state = req.query.state as string;
      const district = req.query.district as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const prices = await MarketService.getLatestPrices({
        cropName,
        state,
        district,
        limit,
      });

      sendSuccess(res, prices);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Get price history for a crop
   */
  static async getPriceHistory(req: Request, res: Response): Promise<void> {
    try {
      const cropName = (req.query.crop as string) || 'Tomato';
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;

      const history = await MarketService.getPriceHistory(cropName, days);
      sendSuccess(res, history);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Admin: Import verified market price dataset
   */
  static async importDataset(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { records } = req.body;
      if (!Array.isArray(records) || records.length === 0) {
        sendError(res, 'Array of market price records is required', 400);
        return;
      }

      const imported = await MarketService.importMarketDataset(records);

      await AuditService.log({
        userId: req.user?.id,
        action: 'MARKET_IMPORT',
        entityType: 'MARKET_PRICE',
        details: { count: imported.length },
      });

      sendSuccess(res, imported, `Successfully imported ${imported.length} market records`, 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }
}
