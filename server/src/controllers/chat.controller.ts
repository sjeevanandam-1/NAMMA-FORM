import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { getIO } from '../services/socket.service.js';

export class ChatController {
  /**
   * Get all conversations for current user
   */
  static async getMyConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;

      const where = role === 'FARMER' ? { farmerId: userId } : { buyerId: userId };

      const conversations = await prisma.conversation.findMany({
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

      sendSuccess(res, conversations);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Start or fetch existing conversation between farmer & buyer for a listing
   */
  static async startConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { farmerId, buyerId, listingId } = req.body;
      const currentUserId = req.user!.id;

      const actualFarmerId = farmerId || (req.user!.role === 'FARMER' ? currentUserId : undefined);
      const actualBuyerId = buyerId || (req.user!.role === 'BUYER' ? currentUserId : undefined);

      if (!actualFarmerId || !actualBuyerId) {
        sendError(res, 'Both farmerId and buyerId are required', 400);
        return;
      }

      let conversation = await prisma.conversation.findFirst({
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
        conversation = await prisma.conversation.create({
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

      sendSuccess(res, conversation);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Get messages for a conversation
   */
  static async getMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const userId = req.user!.id;

      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation || (conversation.farmerId !== userId && conversation.buyerId !== userId)) {
        sendError(res, 'Conversation not found or unauthorized', 403);
        return;
      }

      const messages = await prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: userId },
          isRead: false,
        },
        data: { isRead: true },
      });

      sendSuccess(res, messages);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Send a message via REST (fallback when WebSocket is not used)
   */
  static async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { conversationId, content } = req.body;
      const senderId = req.user!.id;

      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId,
          content,
        },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
        },
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      const io = getIO();
      if (io) {
        io.to(`conv_${conversationId}`).emit('new_message', message);
      }

      sendSuccess(res, message, 'Message sent', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }
}
