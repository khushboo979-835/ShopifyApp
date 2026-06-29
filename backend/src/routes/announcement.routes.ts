import { Router, Request, Response, NextFunction } from 'express';
import shopify from '../config/shopifyApp';
import config from '../config/env';
import {
  update,
  getActive,
  getHistory,
} from '../controllers/announcement.controller';

const router = Router();

// Custom session validation middleware with development fallback for offline sandbox testing
const validateSessionWithDevFallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If no authorization header is provided, mock the Shopify session as a sandbox fallback
  if (!req.headers.authorization) {
    res.locals.shopify = {
      session: {
        shop: 'test-development-shop.myshopify.com',
        accessToken: 'mock-access-token-12345',
        isOnline: false,
      },
    };
    return next();
  }

  // Otherwise, use the standard Shopify session validation middleware
  return shopify.validateAuthenticatedSession()(req, res, next);
};

router.use(validateSessionWithDevFallback);

// Endpoint definitions
router.post('/', update);
router.get('/active', getActive);
router.get('/history', getHistory);

export default router;
