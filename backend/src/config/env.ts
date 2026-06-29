import { cleanEnv, str, num, port } from 'envalid';
import dotenv from 'dotenv';
import path from 'path';

// Load variables from .env file using absolute path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Validate and parse environment variables at runtime.
 * If any required environment variable is missing or invalid,
 * this will throw an informative error and halt application startup.
 */
const validatedEnv = cleanEnv(process.env, {
  // Node Environment
  NODE_ENV: str({
    choices: ['development', 'test', 'production'],
    default: 'development',
    desc: 'Node environment',
  }),

  // Server Port
  PORT: port({
    default: 5000,
    desc: 'Port on which the backend server listens',
  }),

  // Database Connection
  MONGODB_URI: str({
    desc: 'MongoDB connection string (URI)',
    example: 'mongodb://localhost:27017/shopify_announcement_app',
  }),

  // Shopify App Credentials
  SHOPIFY_API_KEY: str({
    desc: 'Shopify Client ID / API Key for OAuth and App Bridge authentication',
  }),
  SHOPIFY_API_SECRET: str({
    desc: 'Shopify Client Secret / API Secret Key for signing requests and OAuth exchange',
  }),

  // JWT configuration for custom token-based sessions
  JWT_SECRET: str({
    desc: 'Secret key for signing JWT access tokens',
    example: 'your-256-bit-access-secret',
  }),
  JWT_REFRESH_SECRET: str({
    desc: 'Secret key for signing JWT refresh tokens',
    example: 'your-256-bit-refresh-secret',
  }),
  JWT_ACCESS_EXPIRY: str({
    default: '15m',
    desc: 'Access token expiry limit (e.g., 15m, 1h)',
  }),
  JWT_REFRESH_EXPIRY: str({
    default: '7d',
    desc: 'Refresh token expiry limit (e.g., 7d)',
  }),

  // Express Rate Limiter Settings
  RATE_LIMIT_WINDOW_MS: num({
    default: 15 * 60 * 1000,
    desc: 'Rate limiter window size in milliseconds (default 15 minutes)',
  }),
  RATE_LIMIT_MAX: num({
    default: 100,
    desc: 'Maximum request count allowed per IP address within the window',
  }),

  // Frontend Client URL
  CLIENT_URL: str({
    default: 'http://localhost:3000',
    desc: 'Frontend Next.js client URL for CORS authorization origin',
  }),

  // Winston Logging Level
  LOG_LEVEL: str({
    choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
    default: 'info',
    desc: 'Winston logger console/file output filtering severity level',
  }),
});

// Create a unified configuration object mapping both uppercase and camelCase variants
export const config = {
  ...validatedEnv,
  // CamelCase mapped properties for flexible code integration
  nodeEnv: validatedEnv.NODE_ENV,
  port: validatedEnv.PORT,
  mongodbUri: validatedEnv.MONGODB_URI,
  shopifyApiKey: validatedEnv.SHOPIFY_API_KEY,
  shopifyApiSecret: validatedEnv.SHOPIFY_API_SECRET,
  jwtSecret: validatedEnv.JWT_SECRET,
  jwtRefreshSecret: validatedEnv.JWT_REFRESH_SECRET,
  jwtAccessExpiry: validatedEnv.JWT_ACCESS_EXPIRY,
  jwtRefreshExpiry: validatedEnv.JWT_REFRESH_EXPIRY,
  rateLimitWindowMs: validatedEnv.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: validatedEnv.RATE_LIMIT_MAX,
  clientUrl: validatedEnv.CLIENT_URL,
  logLevel: validatedEnv.LOG_LEVEL,
};

// Export configuration as default to resolve logger.ts default import
export default config;

// Export Config type
export type Config = typeof config;