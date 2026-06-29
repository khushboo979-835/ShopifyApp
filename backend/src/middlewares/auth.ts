import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from './errorHandler';
import logger from '../config/logger';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Authentication middleware – verifies JWT from Authorization header.
 * Attaches decoded user payload to `req.user`.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required: No token provided', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error: any) {
    logger.warn(`Failed authentication attempt: ${error.message}`);
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid token. Authentication failed.', 401));
  }
};

/**
 * Authorization middleware – restricts access to specific roles.
 * Must be used after `authenticate`.
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized – please authenticate first', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions to access this resource', 403));
    }
    next();
  };
};