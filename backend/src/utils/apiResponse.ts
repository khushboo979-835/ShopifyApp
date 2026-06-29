import { Response } from 'express';

/**
 * Standard success response formatter.
 */
export const sendSuccessResponse = (
  res: Response,
  data: any = null,
  message: string = 'Success',
  statusCode: number = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standard error response formatter (used mainly in controllers when
 * you want to send a custom error without using the global error handler).
 * However, it's recommended to use `next(new AppError(...))` instead.
 * This utility is kept for simple responses.
 */
export const sendErrorResponse = (
  res: Response,
  message: string = 'Something went wrong',
  statusCode: number = 500,
  errors: any = null
) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

/**
 * Paginated response helper.
 */
export const sendPaginatedResponse = (
  res: Response,
  data: any[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Success'
) => {
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