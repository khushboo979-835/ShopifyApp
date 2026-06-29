import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

/**
 * Custom application error class to distinguish operational errors
 * from programming errors.
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    // Capture stack trace (excludes constructor from stack)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware.
 * Sends a formatted error response and logs the error.
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else {
    // Log unexpected (non‑operational) errors with full stack trace
    logger.error(`Unhandled error: ${err.stack || err.message}`);
  }

  // Prepare error response
  const errorResponse: any = {
    success: false,
    message,
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};