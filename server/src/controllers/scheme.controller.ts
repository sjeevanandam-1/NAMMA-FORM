import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class SchemeController {
  /**
   * Get all government schemes with filtering by category, search, and state/level
   */
  static async getSchemes(req: Request, res: Response): Promise<void> {
    try {
      const { category, level, state, search } = req.query;

      const where: any = { isActive: true };

      if (category && category !== 'ALL') {
        where.category = category as string;
      }

      if (level && level !== 'ALL') {
        where.level = level as string;
      }

      if (state && state !== 'ALL') {
        where.OR = [{ state: state as string }, { level: 'CENTRAL' }];
      }

      if (search) {
        where.OR = [
          { title: { contains: search as string } },
          { code: { contains: search as string } },
          { description: { contains: search as string } },
          { benefits: { contains: search as string } },
        ];
      }

      const schemes = await prisma.governmentScheme.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, schemes, 'Government schemes retrieved');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch government schemes', 500);
    }
  }

  /**
   * Get single scheme details
   */
  static async getSchemeById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const scheme = await prisma.governmentScheme.findUnique({
        where: { id },
      });

      if (!scheme) {
        sendError(res, 'Government scheme not found', 404);
        return;
      }

      sendSuccess(res, scheme);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Check eligibility for a farmer
   */
  static async checkEligibility(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { schemeId, landAreaAcre, annualIncome, cropType, isSmallFarmer } = req.body;
      const scheme = await prisma.governmentScheme.findUnique({
        where: { id: schemeId },
      });

      if (!scheme) {
        sendError(res, 'Scheme not found', 404);
        return;
      }

      let isEligible = true;
      const reasons: string[] = [];

      if (scheme.category === 'FINANCIAL_SUPPORT' || scheme.code === 'PM-KISAN') {
        if (landAreaAcre > 0) {
          reasons.push('Valid cultivable landholding verified.');
        } else {
          isEligible = false;
          reasons.push('Requires registered cultivable landholding.');
        }
      }

      if (scheme.code === 'PMKSY-DRIP') {
        if (landAreaAcre <= 5) {
          reasons.push('Eligible for 100% full micro-irrigation subsidy as Small/Marginal Farmer.');
        } else {
          reasons.push('Eligible for 75% micro-irrigation subsidy as Other Farmer.');
        }
      }

      if (scheme.category === 'FARM_MACHINERY') {
        reasons.push('Eligible for 40%-50% capital subsidy on tractor/rotavator purchases.');
      }

      sendSuccess(res, {
        isEligible,
        reasons,
        schemeCode: scheme.code,
        estimatedSubsidy: scheme.maxAmount || 0,
        subsidyPct: scheme.subsidyPct || 50,
      });
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Submit scheme application
   */
  static async submitApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const {
        schemeId,
        applicantName,
        applicantPhone,
        landAreaAcre,
        aadhaarLast4,
        bankAccountNumber,
        ifscCode,
        village,
        district,
        state,
        documentsSubmitted,
      } = req.body;

      const appNumber = `SCH-APP-${Date.now().toString().slice(-6)}`;

      const application = await prisma.schemeApplication.create({
        data: {
          schemeId,
          farmerId,
          applicationNumber: appNumber,
          applicantName: applicantName || req.user!.name,
          applicantPhone: applicantPhone || '9876543210',
          landAreaAcre: parseFloat(landAreaAcre) || 1.0,
          aadhaarLast4: aadhaarLast4 || '0000',
          bankAccountNumber: bankAccountNumber || 'XXXX0000',
          ifscCode: ifscCode || 'SBIN0001',
          village: village || 'Local Village',
          district: district || 'Coimbatore',
          state: state || 'Tamil Nadu',
          documentsSubmitted: JSON.stringify(documentsSubmitted || ['patta.pdf', 'aadhaar.pdf']),
          status: 'SUBMITTED',
        },
        include: { scheme: true },
      });

      sendSuccess(res, application, 'Scheme application submitted successfully', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Get farmer's submitted applications
   */
  static async getMyApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const applications = await prisma.schemeApplication.findMany({
        where: { farmerId },
        include: { scheme: true },
        orderBy: { createdAt: 'desc' },
      });
      sendSuccess(res, applications);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Save/Bookmark scheme
   */
  static async toggleSaveScheme(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { schemeId } = req.body;

      const existing = await prisma.savedScheme.findUnique({
        where: { userId_schemeId: { userId, schemeId } },
      });

      if (existing) {
        await prisma.savedScheme.delete({
          where: { id: existing.id },
        });
        sendSuccess(res, { saved: false }, 'Scheme removed from saved list');
      } else {
        await prisma.savedScheme.create({
          data: { userId, schemeId },
        });
        sendSuccess(res, { saved: true }, 'Scheme saved to your bookmarks');
      }
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }
}
