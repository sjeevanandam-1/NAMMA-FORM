"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationToUser = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const prisma_js_1 = require("../config/prisma.js");
let io = null;
const initSocket = (httpServer, clientUrl) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: [clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    io.on('connection', (socket) => {
        console.log(`[Socket Connected]: ${socket.id}`);
        // Join user room for private notifications
        socket.on('join_user_room', (userId) => {
            if (userId) {
                socket.join(`user_${userId}`);
                console.log(`Socket ${socket.id} joined user room user_${userId}`);
            }
        });
        // Join specific conversation room
        socket.on('join_conversation', (conversationId) => {
            if (conversationId) {
                socket.join(`conv_${conversationId}`);
                console.log(`Socket ${socket.id} joined conversation room conv_${conversationId}`);
            }
        });
        // Handle real-time chat message
        socket.on('send_message', async (data) => {
            try {
                const message = await prisma_js_1.prisma.message.create({
                    data: {
                        conversationId: data.conversationId,
                        senderId: data.senderId,
                        content: data.content,
                    },
                    include: {
                        sender: {
                            select: { id: true, name: true, role: true, avatarUrl: true },
                        },
                    },
                });
                // Update conversation timestamp
                await prisma_js_1.prisma.conversation.update({
                    where: { id: data.conversationId },
                    data: { updatedAt: new Date() },
                });
                // Broadcast to conversation room
                io?.to(`conv_${data.conversationId}`).emit('new_message', message);
            }
            catch (err) {
                console.error('[Socket Send Message Error]:', err);
            }
        });
        socket.on('disconnect', () => {
            console.log(`[Socket Disconnected]: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => io;
exports.getIO = getIO;
const sendNotificationToUser = async (params) => {
    try {
        const notification = await prisma_js_1.prisma.notification.create({
            data: {
                userId: params.userId,
                title: params.title,
                message: params.message,
                type: params.type,
                metadata: params.metadata ? JSON.stringify(params.metadata) : null,
            },
        });
        if (io) {
            io.to(`user_${params.userId}`).emit('new_notification', notification);
        }
        return notification;
    }
    catch (err) {
        console.error('[Notification Service Error]:', err);
    }
};
exports.sendNotificationToUser = sendNotificationToUser;
