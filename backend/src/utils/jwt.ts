import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import logger from '../config/logger';

/**
 * Generates an access token.
 */
export const generateAccessToken = (payload: object): string => {
  try {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRY as any,
    });
  } catch (error: any) {
    logger.error(`Failed to generate access token: ${error.message}`);
    throw new Error('Could not generate access token');
  }
};

/**
 * Generates a refresh token.
 */
export const generateRefreshToken = (payload: object): string => {
  try {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRY as any,
    });
  } catch (error: any) {
    logger.error(`Failed to generate refresh token: ${error.message}`);
    throw new Error('Could not generate refresh token');
  }
};

/**
 * Verifies an access token.
 * Returns the decoded payload or throws an error.
 */
export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error: any) {
    logger.warn(`Access token verification failed: ${error.message}`);
    throw error; // Re-throw to be handled by the caller (e.g., auth middleware)
  }
};

/**
 * Verifies a refresh token.
 */
export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, config.JWT_REFRESH_SECRET);
  } catch (error: any) {
    logger.warn(`Refresh token verification failed: ${error.message}`);
    throw error;
  }
};