import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class ReviewController {
  /**
   * Submit 1-5 star review for a completed order
   */
  static async createReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { orderId, rating, comment } = req.body;
      const reviewerId = req.user!.id;

      if (!rating || rating < 1 || rating > 5) {
        sendError(res, 'Rating must be an integer between 1 and 5', 400);
        return;
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        sendError(res, 'Order not found', 404);
        return;
      }

      // Prevent duplicate review by same user on same order
      const existing = await prisma.review.findUnique({
        where: {
          orderId_reviewerId: {
            orderId,
            reviewerId,
          },
        },
      });

      if (existing) {
        sendError(res, 'You have already submitted a review for this order', 400);
        return;
      }

      const isBuyer = reviewerId === order.buyerId;
      const revieweeId = isBuyer ? order.farmerId : order.buyerId;
      const role = isBuyer ? 'BUYER_TO_FARMER' : 'FARMER_TO_BUYER';

      const review = await prisma.review.create({
        data: {
          orderId,
          reviewerId,
          revieweeId,
          rating: parseInt(rating, 10),
          comment: comment || 'Verified transaction completed smoothly.',
          role,
        },
      });

      // Recalculate AgriTrust Score for reviewee
      const allReviews = await prisma.review.findMany({
        where: { revieweeId },
      });
      const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / (allReviews.length || 1);
      const ratingScore = Math.min(30, (avgRating / 5) * 30);

      await prisma.trustScore.upsert({
        where: { userId: revieweeId },
        update: {
          ratingScore,
          score: Math.min(100, 25 + 30 + ratingScore),
        },
        create: {
          userId: revieweeId,
          score: Math.min(100, 25 + 30 + ratingScore),
          ratingScore,
          explanation: `AgriTrust Score calculated from ${allReviews.length} verified ratings.`,
        },
      });

      sendSuccess(res, review, 'Review and rating submitted successfully', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Get reviews for a user
   */
  static async getUserReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const reviews = await prisma.review.findMany({
        where: { revieweeId: userId },
        include: {
          reviewer: {
            select: { id: true, name: true, role: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, reviews);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}
