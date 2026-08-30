import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { createFarmSchema, updateFarmSchema } from '../validations/farm.validation.js';

export class FarmController {
  /**
   * Get all farms belonging to logged-in farmer
   */
  static async getMyFarms(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const profile = await prisma.farmerProfile.findUnique({
        where: { userId: req.user!.id },
      });

      if (!profile) {
        sendError(res, 'Farmer profile not found', 404);
        return;
      }

      const farms = await prisma.farm.findMany({
        where: { farmerProfileId: profile.id },
        include: {
          listings: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, farms);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Create a new farm
   */
  static async createFarm(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = createFarmSchema.parse(req.body);
      const profile = await prisma.farmerProfile.findUnique({
        where: { userId: req.user!.id },
      });

      if (!profile) {
        sendError(res, 'Farmer profile not found', 404);
        return;
      }

      const cropsString = Array.isArray(data.crops) ? JSON.stringify(data.crops) : data.crops;

      const farm = await prisma.farm.create({
        data: {
          farmerProfileId: profile.id,
          farmName: data.farmName,
          location: data.location,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          landAreaAcre: data.landAreaAcre,
          soilType: data.soilType,
          irrigation: data.irrigation,
          crops: cropsString,
        },
      });

      sendSuccess(res, farm, 'Farm registered successfully', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Update farm
   */
  static async updateFarm(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = updateFarmSchema.parse(req.body);

      const farm = await prisma.farm.findUnique({
        where: { id },
        include: { farmerProfile: true },
      });

      if (!farm || farm.farmerProfile.userId !== req.user!.id) {
        sendError(res, 'Farm not found or unauthorized', 403);
        return;
      }

      const updated = await prisma.farm.update({
        where: { id },
        data: {
          ...data,
          crops: data.crops
            ? Array.isArray(data.crops)
              ? JSON.stringify(data.crops)
              : data.crops
            : undefined,
        },
      });

      sendSuccess(res, updated, 'Farm updated successfully');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Delete farm
   */
  static async deleteFarm(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const farm = await prisma.farm.findUnique({
        where: { id },
        include: { farmerProfile: true },
      });

      if (!farm || farm.farmerProfile.userId !== req.user!.id) {
        sendError(res, 'Farm not found or unauthorized', 403);
        return;
      }

      await prisma.farm.delete({ where: { id } });
      sendSuccess(res, null, 'Farm deleted successfully');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}
