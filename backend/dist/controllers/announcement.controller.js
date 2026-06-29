"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkStore = exports.getHistory = exports.getActive = exports.update = void 0;
const announcement_service_1 = require("../services/announcement.service");
const Announcement_model_1 = require("../models/Announcement.model");
const apiResponse_1 = require("../utils/apiResponse");
const errorHandler_1 = require("../middlewares/errorHandler");
/**
 * Handle new announcement updates, saving to database and pushing to Shopify storefront metafields.
 * POST /api/announcements
 */
const update = async (req, res, next) => {
    try {
        const { announcementText } = req.body;
        const session = res.locals.shopify?.session;
        if (!session || !session.shop || !session.accessToken) {
            return next(new errorHandler_1.AppError('Unauthorized: No active Shopify session found.', 401));
        }
        if (!announcementText || announcementText.trim() === '') {
            return next(new errorHandler_1.AppError('Announcement text cannot be empty', 400));
        }
        // 1. Create audit log entry in MongoDB
        const auditLog = new Announcement_model_1.Announcement({
            announcementText,
            shopDomain: session.shop,
        });
        await auditLog.save();
        // 2. Sync to Shopify metafield
        await (0, announcement_service_1.syncAnnouncementToShopify)(session.shop, session.accessToken, announcementText);
        (0, apiResponse_1.sendSuccessResponse)(res, auditLog, 'Announcement updated and synced successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.update = update;
/**
 * Fetch the current active announcement banner text.
 * GET /api/announcements/active
 */
const getActive = async (req, res, next) => {
    try {
        const session = res.locals.shopify?.session;
        if (!session || !session.shop) {
            return next(new errorHandler_1.AppError('Unauthorized: No active Shopify session found.', 401));
        }
        const latest = await (0, announcement_service_1.getLatestAnnouncement)(session.shop);
        (0, apiResponse_1.sendSuccessResponse)(res, latest || { announcementText: '', shopDomain: session.shop }, 'Active announcement fetched successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getActive = getActive;
/**
 * Fetch paginated history of all announcements for merchant audit review.
 * GET /api/announcements/history
 */
const getHistory = async (req, res, next) => {
    try {
        const session = res.locals.shopify?.session;
        if (!session || !session.shop) {
            return next(new errorHandler_1.AppError('Unauthorized: No active Shopify session found.', 401));
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const historyData = await (0, announcement_service_1.getAnnouncementHistory)(session.shop, page, limit);
        (0, apiResponse_1.sendSuccessResponse)(res, historyData, 'Announcement audit log history fetched successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getHistory = getHistory;
/**
 * Placeholders for unused controller actions.
 */
const linkStore = async (req, res, next) => {
    res.status(410).json({ message: 'Manual linking is deprecated.' });
};
exports.linkStore = linkStore;
