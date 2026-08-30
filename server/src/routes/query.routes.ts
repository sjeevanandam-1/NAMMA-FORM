import { Router } from 'express';
import { QueryController } from '../controllers/query.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/', requireRole(['FARMER']), QueryController.createQuery);
router.get('/my-queries', requireRole(['FARMER']), QueryController.getMyQueries);
router.get('/', requireRole(['GOVERNMENT_OFFICIAL', 'ADMIN']), QueryController.getAllQueries);
router.get('/:id', QueryController.getQueryById);
router.post('/:id/reply', QueryController.replyToQuery);
router.patch('/:id/status', requireRole(['GOVERNMENT_OFFICIAL', 'ADMIN', 'FARMER']), QueryController.updateStatus);

export default router;
