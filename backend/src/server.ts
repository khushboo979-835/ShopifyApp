// Load environment variables at the absolute top of entrypoint
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import logger from './config/logger';
import mongoose from 'mongoose';

/**
 * Starts the server after connecting to the database.
 */
const startServer = async () => {
  try {
    // 1. Establish the database connection first
    await connectDatabase();

    // 2. Start listening on the port once the database setup finishes
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`📡 API URL: http://localhost:${config.port}/api`);
      logger.info(`❤️  Health check: http://localhost:${config.port}/health`);
    });

    // Graceful shutdown handling
    const shutdown = async () => {
      logger.warn('🛑 Shutting down server gracefully...');
      server.close(async (err) => {
        if (err) {
          logger.error(`Error during server shutdown: ${err.message}`);
          process.exit(1);
        }
        try {
          await mongoose.connection.close();
          logger.info('💤 MongoDB connection closed.');
        } catch (mongoErr) {
          logger.error(`Error closing MongoDB: ${mongoErr}`);
        }
        logger.info('💤 Server shut down.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error: any) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();