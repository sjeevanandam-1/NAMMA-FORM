"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class CommunityController {
    /**
     * Get community feed with comments, author details, and likes
     */
    static async getPosts(req, res) {
        try {
            const { category, search } = req.query;
            const where = { isReported: false };
            if (category && category !== 'ALL') {
                where.category = category;
            }
            if (search) {
                where.OR = [
                    { title: { contains: search } },
                    { content: { contains: search } },
                ];
            }
            const posts = await prisma_js_1.prisma.communityPost.findMany({
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
            (0, response_js_1.sendSuccess)(res, posts, 'Community feed retrieved');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to fetch community posts', 500);
        }
    }
    /**
     * Create community post
     */
    static async createPost(req, res) {
        try {
            const authorId = req.user.id;
            const { category, title, content, imageUrl } = req.body;
            if (!title || !content) {
                (0, response_js_1.sendError)(res, 'Title and content are required', 400);
                return;
            }
            const post = await prisma_js_1.prisma.communityPost.create({
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
            (0, response_js_1.sendSuccess)(res, post, 'Post shared with farmer community', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Add comment to post
     */
    static async addComment(req, res) {
        try {
            const authorId = req.user.id;
            const { postId } = req.params;
            const { content } = req.body;
            if (!content || !content.trim()) {
                (0, response_js_1.sendError)(res, 'Comment cannot be empty', 400);
                return;
            }
            const comment = await prisma_js_1.prisma.communityComment.create({
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
            await prisma_js_1.prisma.communityPost.update({
                where: { id: postId },
                data: { commentsCount: { increment: 1 } },
            });
            (0, response_js_1.sendSuccess)(res, comment, 'Comment added', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Like or unlike a post
     */
    static async toggleLike(req, res) {
        try {
            const userId = req.user.id;
            const { postId } = req.params;
            const existing = await prisma_js_1.prisma.communityLike.findUnique({
                where: { postId_userId: { postId, userId } },
            });
            if (existing) {
                await prisma_js_1.prisma.communityLike.delete({
                    where: { id: existing.id },
                });
                await prisma_js_1.prisma.communityPost.update({
                    where: { id: postId },
                    data: { likesCount: { decrement: 1 } },
                });
                (0, response_js_1.sendSuccess)(res, { liked: false });
            }
            else {
                await prisma_js_1.prisma.communityLike.create({
                    data: { postId, userId },
                });
                await prisma_js_1.prisma.communityPost.update({
                    where: { id: postId },
                    data: { likesCount: { increment: 1 } },
                });
                (0, response_js_1.sendSuccess)(res, { liked: true });
            }
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Report inappropriate content
     */
    static async reportPost(req, res) {
        try {
            const userId = req.user.id;
            const { postId } = req.params;
            const { reason } = req.body;
            const report = await prisma_js_1.prisma.communityReport.create({
                data: {
                    postId,
                    userId,
                    reason: reason || 'INAPPROPRIATE',
                    status: 'PENDING',
                },
            });
            (0, response_js_1.sendSuccess)(res, report, 'Post reported for admin moderation', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
}
exports.CommunityController = CommunityController;
