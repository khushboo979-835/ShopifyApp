import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';
import logger from '../config/logger';

/**
 * Middleware factory that validates a request property (body, query, params)
 * against a Joi schema. If validation fails, it calls next() with an AppError.
 */
export const validate = (
  schema: Joi.ObjectSchema,
  property: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,       // Return all validation errors
      stripUnknown: true,      // Remove unknown fields
      allowUnknown: false,     // Reject unknown fields (strict)
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join(', ');
      logger.warn(`Validation error on ${property}: ${messages}`);
      return next(new AppError(`Validation failed: ${messages}`, 400));
    }

    // Replace the request property with the validated (and stripped) value
    req[property] = value;
    next();
  };
};

// ======================
// Reusable Joi Schemas
// ======================

export const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'Password is required',
  }),
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required',
  }),
  role: Joi.string().valid('user', 'admin').default('user'),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Example schema for updating user profile (partial)
export const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  password: Joi.string().min(8),
}).min(1); // At least one field must be present