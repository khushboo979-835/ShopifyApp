import { shopifyApp } from '@shopify/shopify-app-express';
import { MongoDBSessionStorage } from '@shopify/shopify-app-session-storage-mongodb';
import { ApiVersion } from '@shopify/shopify-api';
import config from './env';

// Determine the database name from URI or default to 'shopify_announcement_app'
const dbName = 'shopify_announcement_app';

// Custom URL mock to bypass validation errors for multi-host non-SRV replica list strings
const customDbUrl = {
  toString() {
    return config.mongodbUri;
  },
} as any;

const sessionStorage = new MongoDBSessionStorage(
  customDbUrl,
  dbName,
  { sessionCollectionName: 'shopify_sessions' }
);

export const shopify = shopifyApp({
  api: {
    apiVersion: ApiVersion.October24,
    apiKey: config.shopifyApiKey,
    apiSecretKey: config.shopifyApiSecret,
    scopes: ['write_metafields', 'read_metafields', 'write_themes', 'read_themes'],
    hostName: process.env.HOST ? process.env.HOST.replace(/https?:\/\//, '') : 'localhost',
  },
  auth: {
    path: '/api/auth',
    callbackPath: '/api/auth/callback',
  },
  webhooks: {
    path: '/api/webhooks',
  },
  sessionStorage,
});

export default shopify;
