import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { AuditService } from '../services/audit.service.js';

export class AdminController {
  /**
   * Get all users with roles and verification statuses
   */
  static async getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { role, isVerified, page = '1', limit = '20' } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const where: Record<string, unknown> = {};
      if (role) where.role = String(role);
      if (isVerified !== undefined) where.isVerified = isVerified === 'true';

      const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            phone: true,
            name: true,
            role: true,
            isVerified: true,
            avatarUrl: true,
            createdAt: true,
            farmerProfile: true,
            buyerProfile: true,
            expertProfile: true,
            govProfile: true,
            trustScore: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),
      ]);

      sendSuccess(res, users, 'Users retrieved', 200, {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Verify/Approve user account (Farmer KYC, Buyer GST, or Expert accreditation)
   */
  static async verifyUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isVerified } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: { isVerified: Boolean(isVerified) },
      });

      if (user.role === 'FARMER') {
        await prisma.farmerProfile.updateMany({
          where: { userId: id },
          data: { kycStatus: isVerified ? 'VERIFIED' : 'REJECTED' },
        });
      } else if (user.role === 'BUYER') {
        await prisma.buyerProfile.updateMany({
          where: { userId: id },
          data: { kycStatus: isVerified ? 'VERIFIED' : 'REJECTED' },
        });
      } else if (user.role === 'EXPERT') {
        await prisma.expertProfile.updateMany({
          where: { userId: id },
          data: { isVerified: Boolean(isVerified) },
        });
      }

      await AuditService.log({
        userId: req.user!.id,
        action: 'ADMIN_VERIFY_USER',
        entityType: 'USER',
        entityId: id,
        details: { targetUserId: id, isVerified },
      });

      sendSuccess(res, user, `User verification status updated to ${isVerified}`);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Comprehensive Platform Analytics across all 22 features
   */
  static async getPlatformStats(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const [
        totalFarmers,
        totalBuyers,
        totalExperts,
        totalListings,
        totalOrders,
        completedOrders,
        totalSchemes,
        totalSchemeApplications,
        totalStorageCenters,
        totalEquipment,
        totalTransportVehicles,
        totalLoanProducts,
        totalLoanApplications,
        totalInsurancePolicies,
        totalInsuranceClaims,
        totalWasteListings,
        totalCommunityPosts,
        totalSupportTickets,
        totalDiseaseScans,
        totalAIConversations,
      ] = await Promise.all([
        prisma.user.count({ where: { role: 'FARMER' } }),
        prisma.user.count({ where: { role: 'BUYER' } }),
        prisma.user.count({ where: { role: 'EXPERT' } }),
        prisma.cropListing.count(),
        prisma.order.count(),
        prisma.order.findMany({ where: { status: 'COMPLETED' } }),
        prisma.governmentScheme.count(),
        prisma.schemeApplication.count(),
        prisma.storageCenter.count(),
        prisma.equipment.count(),
        prisma.transportVehicle.count(),
        prisma.agriLoanProduct.count(),
        prisma.loanApplication.count(),
        prisma.insurancePolicy.count(),
        prisma.insuranceClaim.count(),
        prisma.agriWasteListing.count(),
        prisma.communityPost.count(),
        prisma.supportTicket.count(),
        prisma.diseaseScan.count(),
        prisma.aIConversation.count(),
      ]);

      const gmv = completedOrders.reduce((acc, order) => acc + order.grandTotal, 0);

      sendSuccess(res, {
        users: {
          totalFarmers,
          totalBuyers,
          totalExperts,
          totalUsers: totalFarmers + totalBuyers + totalExperts,
        },
        marketplace: {
          totalListings,
          totalOrders,
          grossMerchandiseValue: gmv,
          wasteListings: totalWasteListings,
        },
        schemesAndMSP: {
          totalSchemes,
          totalSchemeApplications,
        },
        logisticsAndStorage: {
          totalStorageCenters,
          totalEquipment,
          totalTransportVehicles,
        },
        financialServices: {
          totalLoanProducts,
          totalLoanApplications,
          totalInsurancePolicies,
          totalInsuranceClaims,
        },
        aiAndDiagnostics: {
          totalDiseaseScans,
          totalAIConversations,
        },
        communityAndSupport: {
          totalCommunityPosts,
          totalSupportTickets,
        },
      });
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * View security & financial audit logs
   */
  static async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { action, entityType, page = '1', limit = '50' } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const where: Record<string, unknown> = {};
      if (action) where.action = String(action);
      if (entityType) where.entityType = String(entityType);

      const [total, logs] = await Promise.all([
        prisma.auditLog.count({ where }),
        prisma.auditLog.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),
      ]);

      sendSuccess(res, logs, 'Audit logs retrieved', 200, {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}
