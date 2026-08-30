"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class ReviewController {
    /**
     * Submit 1-5 star review for a completed order
     */
    static async createReview(req, res) {
        try {
            const { orderId, rating, comment } = req.body;
            const reviewerId = req.user.id;
            if (!rating || rating < 1 || rating > 5) {
                (0, response_js_1.sendError)(res, 'Rating must be an integer between 1 and 5', 400);
                return;
            }
            const order = await prisma_js_1.prisma.order.findUnique({
                where: { id: orderId },
            });
            if (!order) {
                (0, response_js_1.sendError)(res, 'Order not found', 404);
                return;
            }
            // Prevent duplicate review by same user on same order
            const existing = await prisma_js_1.prisma.review.findUnique({
                where: {
                    orderId_reviewerId: {
                        orderId,
                        reviewerId,
                    },
                },
            });
            if (existing) {
                (0, response_js_1.sendError)(res, 'You have already submitted a review for this order', 400);
                return;
            }
            const isBuyer = reviewerId === order.buyerId;
            const revieweeId = isBuyer ? order.farmerId : order.buyerId;
            const role = isBuyer ? 'BUYER_TO_FARMER' : 'FARMER_TO_BUYER';
            const review = await prisma_js_1.prisma.review.create({
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
            const allReviews = await prisma_js_1.prisma.review.findMany({
                where: { revieweeId },
            });
            const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / (allReviews.length || 1);
            const ratingScore = Math.min(30, (avgRating / 5) * 30);
            await prisma_js_1.prisma.trustScore.upsert({
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
            (0, response_js_1.sendSuccess)(res, review, 'Review and rating submitted successfully', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Get reviews for a user
     */
    static async getUserReviews(req, res) {
        try {
            const { userId } = req.params;
            const reviews = await prisma_js_1.prisma.review.findMany({
                where: { revieweeId: userId },
                include: {
                    reviewer: {
                        select: { id: true, name: true, role: true, avatarUrl: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, reviews);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
}
exports.ReviewController = ReviewController;
