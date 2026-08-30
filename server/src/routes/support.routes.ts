import { Router } from 'express';
import { SupportController } from '../controllers/support.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/helplines', SupportController.getHelplineInfo);
router.get('/my-tickets', authenticateToken, SupportController.getMyTickets);
router.post('/tickets', authenticateToken, SupportController.createTicket);
router.post('/tickets/:ticketId/reply', authenticateToken, SupportController.replyTicket);

export default router;
