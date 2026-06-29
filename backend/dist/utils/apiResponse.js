"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPaginatedResponse = exports.sendErrorResponse = exports.sendSuccessResponse = void 0;
/**
 * Standard success response formatter.
 */
const sendSuccessResponse = (res, data = null, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.sendSuccessResponse = sendSuccessResponse;
/**
 * Standard error response formatter (used mainly in controllers when
 * you want to send a custom error without using the global error handler).
 * However, it's recommended to use `next(new AppError(...))` instead.
 * This utility is kept for simple responses.
 */
const sendErrorResponse = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
    res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};
exports.sendErrorResponse = sendErrorResponse;
/**
 * Paginated response helper.
 */
const sendPaginatedResponse = (res, data, total, page, limit, message = 'Success') => {
    const totalPages = Math.ceil(total / limit);
    res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    });
};
exports.sendPaginatedResponse = sendPaginatedResponse;
