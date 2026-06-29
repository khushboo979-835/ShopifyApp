"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userUpdateSchema = exports.refreshTokenSchema = exports.userLoginSchema = exports.userRegistrationSchema = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const errorHandler_1 = require("./errorHandler");
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Middleware factory that validates a request property (body, query, params)
 * against a Joi schema. If validation fails, it calls next() with an AppError.
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Return all validation errors
            stripUnknown: true, // Remove unknown fields
            allowUnknown: false, // Reject unknown fields (strict)
        });
        if (error) {
            const messages = error.details.map((detail) => detail.message).join(', ');
            logger_1.default.warn(`Validation error on ${property}: ${messages}`);
            return next(new errorHandler_1.AppError(`Validation failed: ${messages}`, 400));
        }
        // Replace the request property with the validated (and stripped) value
        req[property] = value;
        next();
    };
};
exports.validate = validate;
// ======================
// Reusable Joi Schemas
// ======================
exports.userRegistrationSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
    }),
    password: joi_1.default.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters',
        'any.required': 'Password is required',
    }),
    name: joi_1.default.string().min(2).max(50).required().messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 50 characters',
        'any.required': 'Name is required',
    }),
    role: joi_1.default.string().valid('user', 'admin').default('user'),
});
exports.userLoginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
exports.refreshTokenSchema = joi_1.default.object({
    refreshToken: joi_1.default.string().required(),
});
// Example schema for updating user profile (partial)
exports.userUpdateSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50),
    email: joi_1.default.string().email(),
    password: joi_1.default.string().min(8),
}).min(1); // At least one field must be present
