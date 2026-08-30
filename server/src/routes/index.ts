import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import farmRoutes from './farm.routes.js';
import cropRoutes from './crop.routes.js';
import listingRoutes from './listing.routes.js';
import marketplaceRoutes from './marketplace.routes.js';
import orderRoutes from './order.routes.js';
import paymentRoutes from './payment.routes.js';
import aiRoutes from './ai.routes.js';
import diseaseRoutes from './disease.routes.js';
import marketRoutes from './market.routes.js';
import weatherRoutes from './weather.routes.js';
import logisticsRoutes from './logistics.routes.js';
import reviewRoutes from './review.routes.js';
import chatRoutes from './chat.routes.js';
import notificationRoutes from './notification.routes.js';
import governmentRoutes from './government.routes.js';
import adminRoutes from './admin.routes.js';
import uploadRoutes from './upload.routes.js';
import queryRoutes from './query.routes.js';

// 22 Features Modular Routes
import schemeRoutes from './scheme.routes.js';
import mspRoutes from './msp.routes.js';
import storageRoutes from './storage.routes.js';
import supportRoutes from './support.routes.js';
import irrigationRoutes from './irrigation.routes.js';
import calendarRoutes from './calendar.routes.js';
import equipmentRoutes from './equipment.routes.js';
import transportRoutes from './transport.routes.js';
import financeRoutes from './finance.routes.js';
import insuranceRoutes from './insurance.routes.js';
import passportRoutes from './passport.routes.js';
import communityRoutes from './community.routes.js';
import wasteRoutes from './waste.routes.js';
import expertRoutes from './expert.routes.js';

const router = Router();

// Core Platform APIs
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/farms', farmRoutes);
router.use('/crops', cropRoutes);
router.use('/listings', listingRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/ai', aiRoutes);
router.use('/disease', diseaseRoutes);
router.use('/market', marketRoutes);
router.use('/weather', weatherRoutes);
router.use('/logistics', logisticsRoutes);
router.use('/reviews', reviewRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/government', governmentRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/queries', queryRoutes);

// All 22 Agricultural Platform Features
router.use('/schemes', schemeRoutes);
router.use('/msp', mspRoutes);
router.use('/storage', storageRoutes);
router.use('/support', supportRoutes);
router.use('/irrigation', irrigationRoutes);
router.use('/calendar', calendarRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/transport', transportRoutes);
router.use('/finance', financeRoutes);
router.use('/insurance', insuranceRoutes);
router.use('/passport', passportRoutes);
router.use('/community', communityRoutes);
router.use('/waste', wasteRoutes);
router.use('/experts', expertRoutes);

export default router;
