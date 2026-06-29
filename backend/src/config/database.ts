import mongoose from 'mongoose';
import dns from 'dns';
import config from './env';
import logger from './logger';

/**
 * Connect to MongoDB using the configured MONGODB_URI.
 * Includes event listeners for monitoring connection state and graceful teardown.
 */
export const connectDatabase = async (): Promise<void> => {
  // Debug log to confirm function entry
  console.log('🔍 Debug: connectDatabase() function reached!');
  logger.info('🔍 Debug: connectDatabase() function reached!');

  const dbUri = config.mongodbUri;

  if (!dbUri) {
    logger.error('❌ MONGODB_URI environment variable is not defined in config.');
    process.exit(1);
  }

  // Connection options optimized for stability and resilience
  const options: mongoose.ConnectOptions = {
    autoIndex: true, // Build indexes (useful in dev/production)
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5s before erroring
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    family: 4, // Use IPv4, skipping IPv6 resolution attempts
  };

  logger.info('🔌 Attempting to connect to MongoDB...');

  // Setup connection event listeners before calling connect
  mongoose.connection.on('connected', () => {
    logger.info('✅ MongoDB Atlas Cloud Database connected successfully!');
  });

  mongoose.connection.on('error', (err: Error) => {
    logger.error(`❌ MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️ MongoDB disconnected. Mongoose will automatically attempt to reconnect.');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('♻️ MongoDB reconnected successfully.');
  });

  // Handle process termination signals to close connection gracefully
  const gracefulExit = async (signal: string) => {
    try {
      await mongoose.connection.close();
      logger.info(`💤 MongoDB connection closed via ${signal}.`);
      process.exit(0);
    } catch (err) {
      logger.error(`❌ Error closing MongoDB connection during ${signal}: ${err}`);
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
    await mongoose.connect(dbUri, options);
  } catch (error: any) {
    logger.error(`❌ Failed to connect to MongoDB on startup: ${error.message}`);
    throw error;
  }
};
