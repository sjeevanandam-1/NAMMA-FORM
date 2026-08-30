"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpertController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class ExpertController {
    /**
     * Get all verified agricultural scientists and extension officers
     */
    static async getExperts(req, res) {
        try {
            const { specialization, search } = req.query;
            const where = { isVerified: true };
            if (specialization && specialization !== 'ALL') {
                where.specialization = specialization;
            }
            if (search) {
                where.OR = [
                    { user: { name: { contains: search } } },
                    { institution: { contains: search } },
                    { bio: { contains: search } },
                ];
            }
            const experts = await prisma_js_1.prisma.expertProfile.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, avatarUrl: true, phone: true, email: true } },
                    availabilities: true,
                    reviews: { take: 5, orderBy: { createdAt: 'desc' } },
                },
                orderBy: { rating: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, experts, 'Agricultural experts retrieved');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to fetch experts', 500);
        }
    }
    /**
     * Book consultation appointment with agricultural expert
     */
    static async bookConsultation(req, res) {
        try {
            const farmerId = req.user.id;
            const { expertProfileId, topic, cropName, problemSummary, cropImageUrl, scheduledDate, scheduledSlot } = req.body;
            const expertProfile = await prisma_js_1.prisma.expertProfile.findUnique({
                where: { id: expertProfileId },
                include: { user: true },
            });
            if (!expertProfile) {
                (0, response_js_1.sendError)(res, 'Expert profile not found', 404);
                return;
            }
            const consultNumber = `EXP-CON-${Date.now().toString().slice(-6)}`;
            const consultation = await prisma_js_1.prisma.expertConsultation.create({
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
            await prisma_js_1.prisma.expertProfile.update({
                where: { id: expertProfileId },
                data: { consultationsCount: expertProfile.consultationsCount + 1 },
            });
            (0, response_js_1.sendSuccess)(res, consultation, 'Expert consultation appointment booked successfully', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Get farmer's consultation appointments
     */
    static async getMyConsultations(req, res) {
        try {
            const userId = req.user.id;
            const consultations = await prisma_js_1.prisma.expertConsultation.findMany({
                where: {
                    OR: [{ farmerId: userId }, { expertId: userId }],
                },
                include: {
                    expertProfile: { include: { user: true } },
                    farmer: { select: { id: true, name: true, phone: true, avatarUrl: true } },
                },
                orderBy: { scheduledDate: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, consultations);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Leave review for an expert
     */
    static async reviewExpert(req, res) {
        try {
            const farmerId = req.user.id;
            const { expertProfileId, rating, feedback } = req.body;
            const review = await prisma_js_1.prisma.expertReview.create({
                data: {
                    expertProfileId,
                    farmerId,
                    rating: parseInt(rating) || 5,
                    feedback,
                },
            });
            (0, response_js_1.sendSuccess)(res, review, 'Expert review submitted', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
}
exports.ExpertController = ExpertController;
