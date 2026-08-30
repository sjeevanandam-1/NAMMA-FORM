import { prisma } from '../config/prisma.js';
import { sendNotificationToUser } from './socket.service.js';

export class QueryService {
  /**
   * Create Farmer Support Query
   */
  static async createQuery(params: {
    farmerId: string;
    category: string;
    crop?: string;
    title: string;
    description: string;
    location: string;
    attachments?: Array<{ fileUrl: string; fileType: string }>;
  }) {
    const { farmerId, category, crop, title, description, location, attachments } = params;

    const query = await prisma.farmerQuery.create({
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
    const govOfficials = await prisma.user.findMany({
      where: { role: 'GOVERNMENT_OFFICIAL' },
      select: { id: true },
    });

    for (const gov of govOfficials) {
      await sendNotificationToUser({
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
  static async getFarmerQueries(farmerId: string) {
    return prisma.farmerQuery.findMany({
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
  static async getAllQueries(params?: { status?: string; category?: string }) {
    const where: any = {};
    if (params?.status) where.status = params.status;
    if (params?.category) where.category = params.category;

    return prisma.farmerQuery.findMany({
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
  static async getQueryById(id: string) {
    return prisma.farmerQuery.findUnique({
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
  static async replyToQuery(params: {
    queryId: string;
    senderId: string;
    content: string;
  }) {
    const { queryId, senderId, content } = params;

    const query = await prisma.farmerQuery.findUnique({
      where: { id: queryId },
      include: { farmer: true },
    });

    if (!query) {
      throw new Error('Query not found');
    }

    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { id: true, name: true, role: true },
    });

    if (!sender) {
      throw new Error('Sender not found');
    }

    // Create message
    const message = await prisma.queryMessage.create({
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

    await prisma.farmerQuery.update({
      where: { id: queryId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    // Send real-time notification
    if (isOfficial) {
      // Notify the farmer
      await sendNotificationToUser({
        userId: query.farmerId,
        title: 'Agricultural Official Replied 📋',
        message: `${sender.name} responded to your query "${query.title}": "${content.slice(0, 80)}..."`,
        type: 'QUERY_RESPONSE',
        metadata: { queryId },
      });
    } else {
      // Notify officials
      const govOfficials = await prisma.user.findMany({
        where: { role: 'GOVERNMENT_OFFICIAL' },
        select: { id: true },
      });
      for (const gov of govOfficials) {
        await sendNotificationToUser({
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
  static async updateStatus(queryId: string, status: string) {
    return prisma.farmerQuery.update({
      where: { id: queryId },
      data: { status, updatedAt: new Date() },
    });
  }
}
