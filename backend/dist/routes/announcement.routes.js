"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shopifyApp_1 = __importDefault(require("../config/shopifyApp"));
const env_1 = __importDefault(require("../config/env"));
const announcement_controller_1 = require("../controllers/announcement.controller");
const router = (0, express_1.Router)();
// Custom session validation middleware with development fallback for offline sandbox testing
const validateSessionWithDevFallback = async (req, res, next) => {
    // If we are in development mode and no authorization header is provided, mock the Shopify session
    if (env_1.default.NODE_ENV === 'development' && !req.headers.authorization) {
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
    return shopifyApp_1.default.validateAuthenticatedSession()(req, res, next);
};
router.use(validateSessionWithDevFallback);
// Endpoint definitions
router.post('/', announcement_controller_1.update);
router.get('/active', announcement_controller_1.getActive);
router.get('/history', announcement_controller_1.getHistory);
exports.default = router;
