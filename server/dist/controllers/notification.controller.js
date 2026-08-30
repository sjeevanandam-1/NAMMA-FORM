"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class NotificationController {
    /**
     * Get all notifications for current user
     */
    static async getNotifications(req, res) {
        try {
            const notifications = await prisma_js_1.prisma.notification.findMany({
                where: { userId: req.user.id },
                orderBy: { createdAt: 'desc' },
                take: 50,
            });
            const unreadCount = await prisma_js_1.prisma.notification.count({
                where: { userId: req.user.id, isRead: false },
            });
            (0, response_js_1.sendSuccess)(res, { notifications, unreadCount });
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Mark single notification as read
     */
    static async markAsRead(req, res) {
        try {
            const { id } = req.params;
            await prisma_js_1.prisma.notification.updateMany({
                where: { id, userId: req.user.id },
                data: { isRead: true },
            });
            (0, response_js_1.sendSuccess)(res, null, 'Notification marked as read');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Mark all notifications as read
     */
    static async markAllAsRead(req, res) {
        try {
            await prisma_js_1.prisma.notification.updateMany({
                where: { userId: req.user.id, isRead: false },
                data: { isRead: true },
            });
            (0, response_js_1.sendSuccess)(res, null, 'All notifications marked as read');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
}
exports.NotificationController = NotificationController;
