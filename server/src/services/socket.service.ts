import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { prisma } from '../config/prisma.js';

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer, clientUrl: string) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket Connected]: ${socket.id}`);

    // Join user room for private notifications
    socket.on('join_user_room', (userId: string) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined user room user_${userId}`);
      }
    });

    // Join specific conversation room
    socket.on('join_conversation', (conversationId: string) => {
      if (conversationId) {
        socket.join(`conv_${conversationId}`);
        console.log(`Socket ${socket.id} joined conversation room conv_${conversationId}`);
      }
    });

    // Handle real-time chat message
    socket.on('send_message', async (data: { conversationId: string; senderId: string; content: string }) => {
      try {
        const message = await prisma.message.create({
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
        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: { updatedAt: new Date() },
        });

        // Broadcast to conversation room
        io?.to(`conv_${data.conversationId}`).emit('new_message', message);
      } catch (err) {
        console.error('[Socket Send Message Error]:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected]: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => io;

export const sendNotificationToUser = async (params: {
  userId: string;
  title: string;
  message: string;
  type: string;
  metadata?: Record<string, unknown>;
}) => {
  try {
    const notification = await prisma.notification.create({
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
  } catch (err) {
    console.error('[Notification Service Error]:', err);
  }
};
