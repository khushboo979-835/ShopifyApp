import { Request, Response, NextFunction } from 'express';
import {
  syncAnnouncementToShopify,
  getLatestAnnouncement,
  getAnnouncementHistory,
} from '../services/announcement.service';
import { Announcement } from '../models/Announcement.model';
import { sendSuccessResponse } from '../utils/apiResponse';
import { AppError } from '../middlewares/errorHandler';

/**
 * Handle new announcement updates, saving to database and pushing to Shopify storefront metafields.
 * POST /api/announcements
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { announcementText } = req.body;
    const session = res.locals.shopify?.session;

    if (!session || !session.shop || !session.accessToken) {
      return next(new AppError('Unauthorized: No active Shopify session found.', 401));
    }

    if (!announcementText || announcementText.trim() === '') {
      return next(new AppError('Announcement text cannot be empty', 400));
    }

    // 1. Create audit log entry in MongoDB
    const auditLog = new Announcement({
      announcementText,
      shopDomain: session.shop,
    });
    await auditLog.save();

    // 2. Sync to Shopify metafield
    await syncAnnouncementToShopify(session.shop, session.accessToken, announcementText);

    sendSuccessResponse(res, auditLog, 'Announcement updated and synced successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch the current active announcement banner text.
 * GET /api/announcements/active
 */
export const getActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = res.locals.shopify?.session;

    if (!session || !session.shop) {
      return next(new AppError('Unauthorized: No active Shopify session found.', 401));
    }

    const latest = await getLatestAnnouncement(session.shop);
    sendSuccessResponse(
      res,
      latest || { announcementText: '', shopDomain: session.shop },
      'Active announcement fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch paginated history of all announcements for merchant audit review.
 * GET /api/announcements/history
 */
export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = res.locals.shopify?.session;

    if (!session || !session.shop) {
      return next(new AppError('Unauthorized: No active Shopify session found.', 401));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const historyData = await getAnnouncementHistory(session.shop, page, limit);
    sendSuccessResponse(res, historyData, 'Announcement audit log history fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Placeholders for unused controller actions.
 */
export const linkStore = async (req: Request, res: Response, next: NextFunction) => {
  res.status(410).json({ message: 'Manual linking is deprecated.' });
};
