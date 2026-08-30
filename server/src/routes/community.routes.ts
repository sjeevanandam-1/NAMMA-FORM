import { Router } from 'express';
import { CommunityController } from '../controllers/community.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/posts', CommunityController.getPosts);
router.post('/posts', authenticateToken, CommunityController.createPost);
router.post('/posts/:postId/comments', authenticateToken, CommunityController.addComment);
router.post('/posts/:postId/like', authenticateToken, CommunityController.toggleLike);
router.post('/posts/:postId/report', authenticateToken, CommunityController.reportPost);

export default router;
