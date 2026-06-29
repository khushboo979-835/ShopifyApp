"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const announcement_routes_1 = __importDefault(require("./announcement.routes"));
const rateLimiter_1 = require("../middlewares/rateLimiter");
const logger_1 = __importDefault(require("../config/logger"));
const router = (0, express_1.Router)();
// Apply global rate limiter to all API routes
router.use(rateLimiter_1.limiter);
// Health check endpoint (public)
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// Mount only the announcements routes
router.use('/announcements', announcement_routes_1.default);
logger_1.default.info('Shopify announcement routes mounted successfully');
exports.default = router;
