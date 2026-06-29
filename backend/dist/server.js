"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables at the absolute top of entrypoint
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const logger_1 = __importDefault(require("./config/logger"));
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Starts the server after connecting to the database.
 */
const startServer = async () => {
    try {
        // 1. Establish the database connection first
        await (0, database_1.connectDatabase)();
        // 2. Start listening on the port once the database setup finishes
        const server = app_1.default.listen(env_1.config.port, () => {
            logger_1.default.info(`🚀 Server running on port ${env_1.config.port} in ${env_1.config.nodeEnv} mode`);
            logger_1.default.info(`📡 API URL: http://localhost:${env_1.config.port}/api`);
            logger_1.default.info(`❤️  Health check: http://localhost:${env_1.config.port}/health`);
        });
        // Graceful shutdown handling
        const shutdown = async () => {
            logger_1.default.warn('🛑 Shutting down server gracefully...');
            server.close(async (err) => {
                if (err) {
                    logger_1.default.error(`Error during server shutdown: ${err.message}`);
                    process.exit(1);
                }
                try {
                    await mongoose_1.default.connection.close();
                    logger_1.default.info('💤 MongoDB connection closed.');
                }
                catch (mongoErr) {
                    logger_1.default.error(`Error closing MongoDB: ${mongoErr}`);
                }
                logger_1.default.info('💤 Server shut down.');
                process.exit(0);
            });
        };
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    }
    catch (error) {
        logger_1.default.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};
// Start the server
startServer();
