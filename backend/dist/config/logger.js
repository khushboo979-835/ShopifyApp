"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = __importDefault(require("./env"));
// Ensure logs directory exists
const logDir = 'logs';
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir);
}
// Define log format
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
// Console format with colors and simple output for development
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.printf(({ level, message, timestamp, stack }) => {
    if (stack) {
        return `${timestamp} [${level}]: ${message} - ${stack}`;
    }
    return `${timestamp} [${level}]: ${message}`;
}));
// Create logger instance
const logger = winston_1.default.createLogger({
    level: env_1.default.nodeEnv === 'production' ? 'info' : 'debug',
    format: logFormat,
    transports: [
        // Write all logs with level 'error' and below to error.log
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, 'error.log'),
            level: 'error',
        }),
        // Write all logs with level 'info' and below to combined.log
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, 'combined.log'),
        }),
    ],
    exceptionHandlers: [
        new winston_1.default.transports.File({ filename: path_1.default.join(logDir, 'exceptions.log') }),
    ],
    rejectionHandlers: [
        new winston_1.default.transports.File({ filename: path_1.default.join(logDir, 'rejections.log') }),
    ],
});
// If not in production, also log to console with simpler format
if (env_1.default.nodeEnv !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: consoleFormat,
    }));
}
// Stream for morgan (if used) - optional
exports.stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};
exports.default = logger;
