import { Router } from 'express';
import announcementRoutes from './announcement.routes';
import { limiter } from '../middlewares/rateLimiter';
import logger from '../config/logger';

const router = Router();

// Apply global rate limiter to all API routes
router.use(limiter);

// Health check endpoint (public)
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount only the announcements routes
router.use('/announcements', announcementRoutes);

logger.info('Shopify announcement routes mounted successfully');

export default router;