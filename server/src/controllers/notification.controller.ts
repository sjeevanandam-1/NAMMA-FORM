import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class NotificationController {
  /**
   * Get all notifications for current user
   */
  static async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const unreadCount = await prisma.notification.count({
        where: { userId: req.user!.id, isRead: false },
      });

      sendSuccess(res, { notifications, unreadCount });
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Mark single notification as read
   */
  static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.notification.updateMany({
        where: { id, userId: req.user!.id },
        data: { isRead: true },
      });

      sendSuccess(res, null, 'Notification marked as read');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: { userId: req.user!.id, isRead: false },
        data: { isRead: true },
      });

      sendSuccess(res, null, 'All notifications marked as read');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}
