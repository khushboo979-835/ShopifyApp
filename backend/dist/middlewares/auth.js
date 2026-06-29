"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errorHandler_1 = require("./errorHandler");
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Authentication middleware – verifies JWT from Authorization header.
 * Attaches decoded user payload to `req.user`.
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new errorHandler_1.AppError('Authentication required: No token provided', 401));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        logger_1.default.warn(`Failed authentication attempt: ${error.message}`);
        if (error.name === 'TokenExpiredError') {
            return next(new errorHandler_1.AppError('Token expired. Please log in again.', 401));
        }
        return next(new errorHandler_1.AppError('Invalid token. Authentication failed.', 401));
    }
};
exports.authenticate = authenticate;
/**
 * Authorization middleware – restricts access to specific roles.
 * Must be used after `authenticate`.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.AppError('Unauthorized – please authenticate first', 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errorHandler_1.AppError('Insufficient permissions to access this resource', 403));
        }
        next();
    };
};
exports.authorize = authorize;
