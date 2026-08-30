import { Router } from 'express';
import { SchemeController } from '../controllers/scheme.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', SchemeController.getSchemes);
router.get('/my-applications', authenticateToken, SchemeController.getMyApplications);
router.get('/:id', SchemeController.getSchemeById);
router.post('/check-eligibility', authenticateToken, SchemeController.checkEligibility);
router.post('/apply', authenticateToken, SchemeController.submitApplication);
router.post('/toggle-save', authenticateToken, SchemeController.toggleSaveScheme);

export default router;
