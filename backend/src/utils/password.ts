import bcrypt from 'bcryptjs';
import logger from '../config/logger';

/**
 * Hashes a plain-text password using bcrypt.
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  } catch (error: any) {
    logger.error(`Password hashing error: ${error.message}`);
    throw new Error('Could not hash password');
  }
};

/**
 * Compares a plain-text password with a hashed password.
 */
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return bcrypt.compare(plainPassword, hashedPassword);
  } catch (error: any) {
    logger.error(`Password comparison error: ${error.message}`);
    throw new Error('Could not verify password');
  }
};