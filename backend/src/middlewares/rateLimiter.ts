import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

/**
 * General rate limiter: 100 requests per IP per 15 minutes.
 */
export const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: config.RATE_LIMIT_MAX || 100,
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
export const authLimiter = rateLimit({
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
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again later.',
  },
});