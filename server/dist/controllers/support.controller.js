"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class SupportController {
    /**
     * Get toll-free assistance helpline directory & configuration
     */
    static async getHelplineInfo(_req, res) {
        try {
            const helplines = {
                kisanCallCenter: {
                    name: 'Kisan Call Centre (KCC Toll-Free)',
                    number: '1800-180-1551',
                    timing: '6:00 AM - 10:00 PM (All 7 Days)',
                    languages: ['Tamil', 'English', 'Hindi', 'Malayalam', 'Telugu', 'Kannada'],
                    description: 'Direct agricultural scientist extension line for immediate field advisory.',
                },
                nammaFarmDirectAI: {
                    name: 'Namma Farm AI Helpline & Technical Desk',
                    number: '1800-889-FARM (3276)',
                    timing: '24x7 Automated Voice & Support',
                    languages: ['Tamil', 'English'],
                    description: 'Instant ticket tracking, marketplace dispute resolution, and crop guidance.',
                },
                pmKisanHelpline: {
                    name: 'PM-KISAN Direct Beneficiary Helpline',
                    number: '155261 / 011-24300606',
                    timing: '9:00 AM - 6:00 PM (Mon-Fri)',
                    description: 'Installment status and Aadhaar eKYC rectification helpline.',
                },
                emergencyDisasterHelpline: {
                    name: 'State Agrarian Disaster & Weather Warning Helpline',
                    number: '1070 / 1077 (District Disaster Control)',
                    timing: '24x7 Emergency Line',
                    description: 'Emergency response for flood, hailstorm, and cyclone compensation.',
                },
            };
            (0, response_js_1.sendSuccess)(res, helplines, 'Toll-free helplines retrieved');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Create a new support ticket
     */
    static async createTicket(req, res) {
        try {
            const userId = req.user.id;
            const { category, priority, subject, description, attachmentUrl } = req.body;
            const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;
            const ticket = await prisma_js_1.prisma.supportTicket.create({
                data: {
                    ticketNumber,
                    userId,
                    category: category || 'GENERAL_ADVISORY',
                    priority: priority || 'MEDIUM',
                    subject,
                    description,
                    status: 'OPEN',
                    assignedTo: 'Namma Farm Agricultural Support Team',
                    messages: {
                        create: [
                            {
                                senderId: userId,
                                senderType: 'USER',
                                message: description,
                                attachmentUrl,
                            },
                        ],
                    },
                },
                include: { messages: true },
            });
            (0, response_js_1.sendSuccess)(res, ticket, 'Support ticket created successfully', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Get user's support tickets
     */
    static async getMyTickets(req, res) {
        try {
            const userId = req.user.id;
            const tickets = await prisma_js_1.prisma.supportTicket.findMany({
                where: { userId },
                include: { messages: { orderBy: { createdAt: 'asc' } } },
                orderBy: { createdAt: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, tickets);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Reply to a support ticket
     */
    static async replyTicket(req, res) {
        try {
            const userId = req.user.id;
            const { ticketId } = req.params;
            const { message, attachmentUrl } = req.body;
            const ticket = await prisma_js_1.prisma.supportTicket.findUnique({
                where: { id: ticketId },
            });
            if (!ticket) {
                (0, response_js_1.sendError)(res, 'Ticket not found', 404);
                return;
            }
            const msg = await prisma_js_1.prisma.ticketMessage.create({
                data: {
                    ticketId,
                    senderId: userId,
                    senderType: req.user.role === 'ADMIN' ? 'SUPPORT_AGENT' : 'USER',
                    message,
                    attachmentUrl,
                },
            });
            // Update ticket status to in progress
            await prisma_js_1.prisma.supportTicket.update({
                where: { id: ticketId },
                data: { status: 'IN_PROGRESS', updatedAt: new Date() },
            });
            (0, response_js_1.sendSuccess)(res, msg, 'Reply added successfully');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
}
exports.SupportController = SupportController;
