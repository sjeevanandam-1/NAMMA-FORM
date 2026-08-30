"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
const socket_service_js_1 = require("../services/socket.service.js");
class ChatController {
    /**
     * Get all conversations for current user
     */
    static async getMyConversations(req, res) {
        try {
            const userId = req.user.id;
            const role = req.user.role;
            const where = role === 'FARMER' ? { farmerId: userId } : { buyerId: userId };
            const conversations = await prisma_js_1.prisma.conversation.findMany({
                where,
                include: {
                    farmer: { select: { id: true, name: true, avatarUrl: true, role: true } },
                    buyer: { select: { id: true, name: true, avatarUrl: true, role: true } },
                    listing: { include: { crop: true } },
                    messages: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                    },
                },
                orderBy: { updatedAt: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, conversations);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Start or fetch existing conversation between farmer & buyer for a listing
     */
    static async startConversation(req, res) {
        try {
            const { farmerId, buyerId, listingId } = req.body;
            const currentUserId = req.user.id;
            const actualFarmerId = farmerId || (req.user.role === 'FARMER' ? currentUserId : undefined);
            const actualBuyerId = buyerId || (req.user.role === 'BUYER' ? currentUserId : undefined);
            if (!actualFarmerId || !actualBuyerId) {
                (0, response_js_1.sendError)(res, 'Both farmerId and buyerId are required', 400);
                return;
            }
            let conversation = await prisma_js_1.prisma.conversation.findFirst({
                where: {
                    farmerId: actualFarmerId,
                    buyerId: actualBuyerId,
                    listingId: listingId || null,
                },
                include: {
                    farmer: { select: { id: true, name: true, avatarUrl: true } },
                    buyer: { select: { id: true, name: true, avatarUrl: true } },
                    listing: { include: { crop: true } },
                    messages: { orderBy: { createdAt: 'asc' } },
                },
            });
            if (!conversation) {
                conversation = await prisma_js_1.prisma.conversation.create({
                    data: {
                        farmerId: actualFarmerId,
                        buyerId: actualBuyerId,
                        listingId: listingId || null,
                    },
                    include: {
                        farmer: { select: { id: true, name: true, avatarUrl: true } },
                        buyer: { select: { id: true, name: true, avatarUrl: true } },
                        listing: { include: { crop: true } },
                        messages: { orderBy: { createdAt: 'asc' } },
                    },
                });
            }
            (0, response_js_1.sendSuccess)(res, conversation);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Get messages for a conversation
     */
    static async getMessages(req, res) {
        try {
            const { conversationId } = req.params;
            const userId = req.user.id;
            const conversation = await prisma_js_1.prisma.conversation.findUnique({
                where: { id: conversationId },
            });
            if (!conversation || (conversation.farmerId !== userId && conversation.buyerId !== userId)) {
                (0, response_js_1.sendError)(res, 'Conversation not found or unauthorized', 403);
                return;
            }
            const messages = await prisma_js_1.prisma.message.findMany({
                where: { conversationId },
                include: {
                    sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
                },
                orderBy: { createdAt: 'asc' },
            });
            // Mark messages as read
            await prisma_js_1.prisma.message.updateMany({
                where: {
                    conversationId,
                    senderId: { not: userId },
                    isRead: false,
                },
                data: { isRead: true },
            });
            (0, response_js_1.sendSuccess)(res, messages);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Send a message via REST (fallback when WebSocket is not used)
     */
    static async sendMessage(req, res) {
        try {
            const { conversationId, content } = req.body;
            const senderId = req.user.id;
            const message = await prisma_js_1.prisma.message.create({
                data: {
                    conversationId,
                    senderId,
                    content,
                },
                include: {
                    sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
                },
            });
            await prisma_js_1.prisma.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() },
            });
            const io = (0, socket_service_js_1.getIO)();
            if (io) {
                io.to(`conv_${conversationId}`).emit('new_message', message);
            }
            (0, response_js_1.sendSuccess)(res, message, 'Message sent', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
}
exports.ChatController = ChatController;
