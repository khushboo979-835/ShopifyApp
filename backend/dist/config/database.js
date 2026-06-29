"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = __importDefault(require("./env"));
const logger_1 = __importDefault(require("./logger"));
/**
 * Connect to MongoDB using the configured MONGODB_URI.
 * Includes event listeners for monitoring connection state and graceful teardown.
 */
const connectDatabase = async () => {
    // Debug log to confirm function entry
    console.log('🔍 Debug: connectDatabase() function reached!');
    logger_1.default.info('🔍 Debug: connectDatabase() function reached!');
    const dbUri = env_1.default.mongodbUri;
    if (!dbUri) {
        logger_1.default.error('❌ MONGODB_URI environment variable is not defined in config.');
        process.exit(1);
    }
    // Connection options optimized for stability and resilience
    const options = {
        autoIndex: true, // Build indexes (useful in dev/production)
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5s before erroring
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        family: 4, // Use IPv4, skipping IPv6 resolution attempts
    };
    logger_1.default.info('🔌 Attempting to connect to MongoDB...');
    // Setup connection event listeners before calling connect
    mongoose_1.default.connection.on('connected', () => {
        logger_1.default.info('✅ MongoDB Atlas Cloud Database connected successfully!');
    });
    mongoose_1.default.connection.on('error', (err) => {
        logger_1.default.error(`❌ MongoDB connection error: ${err.message}`);
    });
    mongoose_1.default.connection.on('disconnected', () => {
        logger_1.default.warn('⚠️ MongoDB disconnected. Mongoose will automatically attempt to reconnect.');
    });
    mongoose_1.default.connection.on('reconnected', () => {
        logger_1.default.info('♻️ MongoDB reconnected successfully.');
    });
    // Handle process termination signals to close connection gracefully
    const gracefulExit = async (signal) => {
        try {
            await mongoose_1.default.connection.close();
            logger_1.default.info(`💤 MongoDB connection closed via ${signal}.`);
            process.exit(0);
        }
        catch (err) {
            logger_1.default.error(`❌ Error closing MongoDB connection during ${signal}: ${err}`);
            process.exit(1);
        }
    };
    process.on('SIGINT', () => gracefulExit('SIGINT'));
    process.on('SIGTERM', () => gracefulExit('SIGTERM'));
    // Fix for Node.js 20+ DNS SRV resolution issues on Windows local hosts (disabled by default)
    /*
    try {
      dns.setServers(['1.1.1.1', '8.8.8.8']);
      logger.info('📡 Configured explicit DNS servers (1.1.1.1, 8.8.8.8) for database SRV resolution.');
    } catch (dnsErr: any) {
      logger.warn(`⚠️ Failed to set DNS servers explicitly: ${dnsErr.message}. Attempting connection with default DNS.`);
    }
    */
    try {
        await mongoose_1.default.connect(dbUri, options);
    }
    catch (error) {
        logger_1.default.error(`❌ Failed to connect to MongoDB on startup: ${error.message}`);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
