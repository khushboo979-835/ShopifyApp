"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Hashes a plain-text password using bcrypt.
 */
const hashPassword = async (password) => {
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        return bcryptjs_1.default.hash(password, salt);
    }
    catch (error) {
        logger_1.default.error(`Password hashing error: ${error.message}`);
        throw new Error('Could not hash password');
    }
};
exports.hashPassword = hashPassword;
/**
 * Compares a plain-text password with a hashed password.
 */
const comparePassword = async (plainPassword, hashedPassword) => {
    try {
        return bcryptjs_1.default.compare(plainPassword, hashedPassword);
    }
    catch (error) {
        logger_1.default.error(`Password comparison error: ${error.message}`);
        throw new Error('Could not verify password');
    }
};
exports.comparePassword = comparePassword;
