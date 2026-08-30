import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class UserController {
  /**
   * Update current user profile
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, phone, avatarUrl, farmerProfile, buyerProfile } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name || undefined,
          phone: phone || undefined,
          avatarUrl: avatarUrl || (req.file ? `/uploads/${req.file.filename}` : undefined),
        },
      });

      if (req.user!.role === 'FARMER' && farmerProfile) {
        await prisma.farmerProfile.updateMany({
          where: { userId },
          data: {
            state: farmerProfile.state,
            district: farmerProfile.district,
            village: farmerProfile.village,
            farmLocation: farmerProfile.farmLocation,
            soilType: farmerProfile.soilType,
            irrigationType: farmerProfile.irrigationType,
            mainCrops: Array.isArray(farmerProfile.mainCrops)
              ? JSON.stringify(farmerProfile.mainCrops)
              : farmerProfile.mainCrops,
          },
        });
      } else if (req.user!.role === 'BUYER' && buyerProfile) {
        await prisma.buyerProfile.updateMany({
          where: { userId },
          data: {
            companyName: buyerProfile.companyName,
            businessType: buyerProfile.businessType,
            gstNumber: buyerProfile.gstNumber,
            state: buyerProfile.state,
            district: buyerProfile.district,
            location: buyerProfile.location,
            requiredCrops: Array.isArray(buyerProfile.requiredCrops)
              ? JSON.stringify(buyerProfile.requiredCrops)
              : buyerProfile.requiredCrops,
          },
        });
      }

      sendSuccess(res, updatedUser, 'Profile updated successfully');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Get public profile with trust score and reviews
   */
  static async getPublicProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          role: true,
          isVerified: true,
          avatarUrl: true,
          farmerProfile: {
            select: {
              state: true,
              district: true,
              village: true,
              landAreaAcre: true,
              soilType: true,
              irrigationType: true,
              mainCrops: true,
              kycStatus: true,
            },
          },
          buyerProfile: {
            select: {
              companyName: true,
              businessType: true,
              state: true,
              district: true,
              location: true,
              requiredCrops: true,
              kycStatus: true,
            },
          },
          trustScore: true,
          reviewsReceived: {
            include: {
              reviewer: { select: { id: true, name: true, role: true } },
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      sendSuccess(res, user);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}
