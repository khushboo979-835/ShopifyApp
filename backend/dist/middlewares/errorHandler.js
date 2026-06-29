"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Custom application error class to distinguish operational errors
 * from programming errors.
 */
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        // Capture stack trace (excludes constructor from stack)
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * Global error handling middleware.
 * Sends a formatted error response and logs the error.
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let isOperational = false;
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        isOperational = err.isOperational;
    }
    else {
        // Log unexpected (non‑operational) errors with full stack trace
        logger_1.default.error(`Unhandled error: ${err.stack || err.message}`);
    }
    // Prepare error response
    const errorResponse = {
        success: false,
        message,
    };
    // Include stack trace only in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
