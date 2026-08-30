import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/conversations', ChatController.getMyConversations);
router.post('/conversations', ChatController.startConversation);
router.get('/messages/:conversationId', ChatController.getMessages);
router.post('/messages', ChatController.sendMessage);

export default router;
