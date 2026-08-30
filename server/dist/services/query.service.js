"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryService = void 0;
const prisma_js_1 = require("../config/prisma.js");
const socket_service_js_1 = require("./socket.service.js");
class QueryService {
    /**
     * Create Farmer Support Query
     */
    static async createQuery(params) {
        const { farmerId, category, crop, title, description, location, attachments } = params;
        const query = await prisma_js_1.prisma.farmerQuery.create({
            data: {
                farmerId,
                category,
                crop,
                title,
                description,
                location,
                status: 'OPEN',
                attachments: attachments && attachments.length > 0
                    ? {
                        create: attachments.map((a) => ({
                            fileUrl: a.fileUrl,
                            fileType: a.fileType || 'IMAGE',
                        })),
                    }
                    : undefined,
            },
            include: {
                farmer: { select: { id: true, name: true, phone: true } },
                attachments: true,
            },
        });
        // Notify Regional Government Agricultural Officials
        const govOfficials = await prisma_js_1.prisma.user.findMany({
            where: { role: 'GOVERNMENT_OFFICIAL' },
            select: { id: true },
        });
        for (const gov of govOfficials) {
            await (0, socket_service_js_1.sendNotificationToUser)({
                userId: gov.id,
                title: 'New Farmer Agronomy Query 🌾',
                message: `Farmer ${query.farmer.name} submitted a ${category} query: "${title}".`,
                type: 'FARMER_QUERY',
                metadata: { queryId: query.id },
            });
        }
        return query;
    }
    /**
     * Get queries submitted by a farmer
     */
    static async getFarmerQueries(farmerId) {
        return prisma_js_1.prisma.farmerQuery.findMany({
            where: { farmerId },
            orderBy: { createdAt: 'desc' },
            include: {
                attachments: true,
                messages: {
                    include: {
                        sender: { select: { id: true, name: true, role: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }
    /**
     * Get all queries (for Government Officials & Admin)
     */
    static async getAllQueries(params) {
        const where = {};
        if (params?.status)
            where.status = params.status;
        if (params?.category)
            where.category = params.category;
        return prisma_js_1.prisma.farmerQuery.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                farmer: { select: { id: true, name: true, phone: true } },
                attachments: true,
                messages: {
                    include: {
                        sender: { select: { id: true, name: true, role: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }
    /**
     * Get single query details
     */
    static async getQueryById(id) {
        return prisma_js_1.prisma.farmerQuery.findUnique({
            where: { id },
            include: {
                farmer: { select: { id: true, name: true, phone: true, email: true } },
                attachments: true,
                messages: {
                    include: {
                        sender: { select: { id: true, name: true, role: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }
    /**
     * Reply to Query (Official or Farmer)
     */
    static async replyToQuery(params) {
        const { queryId, senderId, content } = params;
        const query = await prisma_js_1.prisma.farmerQuery.findUnique({
            where: { id: queryId },
            include: { farmer: true },
        });
        if (!query) {
            throw new Error('Query not found');
        }
        const sender = await prisma_js_1.prisma.user.findUnique({
            where: { id: senderId },
            select: { id: true, name: true, role: true },
        });
        if (!sender) {
            throw new Error('Sender not found');
        }
        // Create message
        const message = await prisma_js_1.prisma.queryMessage.create({
            data: {
                queryId,
                senderId,
                content,
            },
            include: {
                sender: { select: { id: true, name: true, role: true } },
            },
        });
        // Update query status & timestamp
        const isOfficial = sender.role === 'GOVERNMENT_OFFICIAL' || sender.role === 'ADMIN';
        const newStatus = isOfficial ? 'ANSWERED' : 'IN_PROGRESS';
        await prisma_js_1.prisma.farmerQuery.update({
            where: { id: queryId },
            data: {
                status: newStatus,
                updatedAt: new Date(),
            },
        });
        // Send real-time notification
        if (isOfficial) {
            // Notify the farmer
            await (0, socket_service_js_1.sendNotificationToUser)({
                userId: query.farmerId,
                title: 'Agricultural Official Replied 📋',
                message: `${sender.name} responded to your query "${query.title}": "${content.slice(0, 80)}..."`,
                type: 'QUERY_RESPONSE',
                metadata: { queryId },
            });
        }
        else {
            // Notify officials
            const govOfficials = await prisma_js_1.prisma.user.findMany({
                where: { role: 'GOVERNMENT_OFFICIAL' },
                select: { id: true },
            });
            for (const gov of govOfficials) {
                await (0, socket_service_js_1.sendNotificationToUser)({
                    userId: gov.id,
                    title: 'Farmer Replied to Query 🌾',
                    message: `${sender.name} sent a follow-up on "${query.title}".`,
                    type: 'QUERY_FOLLOWUP',
                    metadata: { queryId },
                });
            }
        }
        return message;
    }
    /**
     * Update Query Status
     */
    static async updateStatus(queryId, status) {
        return prisma_js_1.prisma.farmerQuery.update({
            where: { id: queryId },
            data: { status, updatedAt: new Date() },
        });
    }
}
exports.QueryService = QueryService;
