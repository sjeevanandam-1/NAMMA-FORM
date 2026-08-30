import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class ExpertController {
  /**
   * Get all verified agricultural scientists and extension officers
   */
  static async getExperts(req: Request, res: Response): Promise<void> {
    try {
      const { specialization, search } = req.query;
      const where: any = { isVerified: true };

      if (specialization && specialization !== 'ALL') {
        where.specialization = specialization as string;
      }

      if (search) {
        where.OR = [
          { user: { name: { contains: search as string } } },
          { institution: { contains: search as string } },
          { bio: { contains: search as string } },
        ];
      }

      const experts = await prisma.expertProfile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, phone: true, email: true } },
          availabilities: true,
          reviews: { take: 5, orderBy: { createdAt: 'desc' } },
        },
        orderBy: { rating: 'desc' },
      });

      sendSuccess(res, experts, 'Agricultural experts retrieved');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch experts', 500);
    }
  }

  /**
   * Book consultation appointment with agricultural expert
   */
  static async bookConsultation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const { expertProfileId, topic, cropName, problemSummary, cropImageUrl, scheduledDate, scheduledSlot } = req.body;

      const expertProfile = await prisma.expertProfile.findUnique({
        where: { id: expertProfileId },
        include: { user: true },
      });

      if (!expertProfile) {
        sendError(res, 'Expert profile not found', 404);
        return;
      }

      const consultNumber = `EXP-CON-${Date.now().toString().slice(-6)}`;

      const consultation = await prisma.expertConsultation.create({
        data: {
          consultationNumber: consultNumber,
          farmerId,
          expertId: expertProfile.userId,
          expertProfileId,
          topic: topic || 'PEST_DISEASE_DIAGNOSIS',
          cropName,
          problemSummary,
          cropImageUrl,
          scheduledDate: new Date(scheduledDate || Date.now() + 24 * 60 * 60 * 1000),
          scheduledSlot: scheduledSlot || '10:00 AM - 10:30 AM',
          status: 'SCHEDULED',
        },
        include: { expertProfile: { include: { user: true } } },
      });

      // Increment expert consultation count
      await prisma.expertProfile.update({
        where: { id: expertProfileId },
        data: { consultationsCount: expertProfile.consultationsCount + 1 },
      });

      sendSuccess(res, consultation, 'Expert consultation appointment booked successfully', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Get farmer's consultation appointments
   */
  static async getMyConsultations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const consultations = await prisma.expertConsultation.findMany({
        where: {
          OR: [{ farmerId: userId }, { expertId: userId }],
        },
        include: {
          expertProfile: { include: { user: true } },
          farmer: { select: { id: true, name: true, phone: true, avatarUrl: true } },
        },
        orderBy: { scheduledDate: 'desc' },
      });

      sendSuccess(res, consultations);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Leave review for an expert
   */
  static async reviewExpert(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const { expertProfileId, rating, feedback } = req.body;

      const review = await prisma.expertReview.create({
        data: {
          expertProfileId,
          farmerId,
          rating: parseInt(rating) || 5,
          feedback,
        },
      });

      sendSuccess(res, review, 'Expert review submitted', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }
}
