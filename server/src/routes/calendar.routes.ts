import { Router } from 'express';
import { CalendarController } from '../controllers/calendar.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/my-calendars', authenticateToken, CalendarController.getMyCalendars);
router.post('/create', authenticateToken, CalendarController.createCropCalendar);
router.patch('/tasks/:taskId/toggle', authenticateToken, CalendarController.toggleTaskStatus);

export default router;
