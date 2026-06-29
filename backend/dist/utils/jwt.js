"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Generates an access token.
 */
const generateAccessToken = (payload) => {
    try {
        return jsonwebtoken_1.default.sign(payload, env_1.config.JWT_SECRET, {
            expiresIn: env_1.config.JWT_ACCESS_EXPIRY,
        });
    }
    catch (error) {
        logger_1.default.error(`Failed to generate access token: ${error.message}`);
        throw new Error('Could not generate access token');
    }
};
exports.generateAccessToken = generateAccessToken;
/**
 * Generates a refresh token.
 */
const generateRefreshToken = (payload) => {
    try {
        return jsonwebtoken_1.default.sign(payload, env_1.config.JWT_REFRESH_SECRET, {
            expiresIn: env_1.config.JWT_REFRESH_EXPIRY,
        });
    }
    catch (error) {
        logger_1.default.error(`Failed to generate refresh token: ${error.message}`);
        throw new Error('Could not generate refresh token');
    }
};
exports.generateRefreshToken = generateRefreshToken;
/**
 * Verifies an access token.
 * Returns the decoded payload or throws an error.
 */
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.config.JWT_SECRET);
    }
    catch (error) {
        logger_1.default.warn(`Access token verification failed: ${error.message}`);
        throw error; // Re-throw to be handled by the caller (e.g., auth middleware)
    }
};
exports.verifyAccessToken = verifyAccessToken;
/**
 * Verifies a refresh token.
 */
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.config.JWT_REFRESH_SECRET);
    }
    catch (error) {
        logger_1.default.warn(`Refresh token verification failed: ${error.message}`);
        throw error;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
