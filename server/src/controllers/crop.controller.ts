import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class CropController {
  /**
   * Get all master crops catalog
   */
  static async getAllCrops(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;
      const where = category ? { category: String(category) } : {};

      const crops = await prisma.crop.findMany({
        where,
        orderBy: { name: 'asc' },
      });

      sendSuccess(res, crops);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Get crop by ID with latest market prices and predictions
   */
  static async getCropById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const crop = await prisma.crop.findUnique({
        where: { id },
        include: {
          marketPrices: {
            orderBy: { recordDate: 'desc' },
            take: 10,
          },
          predictions: {
            orderBy: { calculatedAt: 'desc' },
            take: 1,
          },
        },
      });

      if (!crop) {
        sendError(res, 'Crop not found', 404);
        return;
      }

      sendSuccess(res, crop);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Admin: Add new crop to master catalog
   */
  static async createCrop(req: Request, res: Response): Promise<void> {
    try {
      const { name, category, variety, description, season, idealSoil, gestationPeriodDays, imageUrl } = req.body;
      const crop = await prisma.crop.create({
        data: {
          name,
          category,
          variety: variety || null,
          description,
          season,
          idealSoil,
          gestationPeriodDays: parseInt(gestationPeriodDays, 10),
          imageUrl: imageUrl || null,
        },
      });

      sendSuccess(res, crop, 'Crop added to catalog', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }
}
