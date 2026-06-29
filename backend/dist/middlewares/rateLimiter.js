"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetLimiter = exports.authLimiter = exports.limiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../config/env");
/**
 * General rate limiter: 100 requests per IP per 15 minutes.
 */
exports.limiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.config.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
    max: env_1.config.RATE_LIMIT_MAX || 100,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the deprecated `X-RateLimit-*` headers
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
    },
    skipSuccessfulRequests: false, // Count all requests
});
/**
 * Stricter limiter for authentication endpoints (e.g., login, register).
 * Allows only 10 requests per IP per 15 minutes to prevent brute‑force.
 */
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
    skipSuccessfulRequests: false,
});
/**
 * Optional: Very strict limiter for password reset / OTP endpoints.
 * Allows 5 requests per hour.
 */
exports.passwordResetLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many password reset requests. Please try again later.',
    },
});
