import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class CommunityController {
  /**
   * Get community feed with comments, author details, and likes
   */
  static async getPosts(req: Request, res: Response): Promise<void> {
    try {
      const { category, search } = req.query;
      const where: any = { isReported: false };

      if (category && category !== 'ALL') {
        where.category = category as string;
      }

      if (search) {
        where.OR = [
          { title: { contains: search as string } },
          { content: { contains: search as string } },
        ];
      }

      const posts = await prisma.communityPost.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true, role: true } },
          comments: {
            include: {
              author: { select: { id: true, name: true, avatarUrl: true, role: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
          likes: true,
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      });

      sendSuccess(res, posts, 'Community feed retrieved');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch community posts', 500);
    }
  }

  /**
   * Create community post
   */
  static async createPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const authorId = req.user!.id;
      const { category, title, content, imageUrl } = req.body;

      if (!title || !content) {
        sendError(res, 'Title and content are required', 400);
        return;
      }

      const post = await prisma.communityPost.create({
        data: {
          authorId,
          category: category || 'FARMING_TIPS',
          title,
          content,
          imageUrl,
        },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true, role: true } },
          comments: true,
          likes: true,
        },
      });

      sendSuccess(res, post, 'Post shared with farmer community', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Add comment to post
   */
  static async addComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const authorId = req.user!.id;
      const { postId } = req.params;
      const { content } = req.body;

      if (!content || !content.trim()) {
        sendError(res, 'Comment cannot be empty', 400);
        return;
      }

      const comment = await prisma.communityComment.create({
        data: {
          postId,
          authorId,
          content: content.trim(),
        },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true, role: true } },
        },
      });

      // Update comments count
      await prisma.communityPost.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } },
      });

      sendSuccess(res, comment, 'Comment added', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Like or unlike a post
   */
  static async toggleLike(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { postId } = req.params;

      const existing = await prisma.communityLike.findUnique({
        where: { postId_userId: { postId, userId } },
      });

      if (existing) {
        await prisma.communityLike.delete({
          where: { id: existing.id },
        });
        await prisma.communityPost.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
        });
        sendSuccess(res, { liked: false });
      } else {
        await prisma.communityLike.create({
          data: { postId, userId },
        });
        await prisma.communityPost.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } },
        });
        sendSuccess(res, { liked: true });
      }
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Report inappropriate content
   */
  static async reportPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { postId } = req.params;
      const { reason } = req.body;

      const report = await prisma.communityReport.create({
        data: {
          postId,
          userId,
          reason: reason || 'INAPPROPRIATE',
          status: 'PENDING',
        },
      });

      sendSuccess(res, report, 'Post reported for admin moderation', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }
}
