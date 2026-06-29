"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopify = void 0;
const shopify_app_express_1 = require("@shopify/shopify-app-express");
const shopify_app_session_storage_mongodb_1 = require("@shopify/shopify-app-session-storage-mongodb");
const shopify_api_1 = require("@shopify/shopify-api");
const env_1 = __importDefault(require("./env"));
// Determine the database name from URI or default to 'shopify_announcement_app'
const dbName = 'shopify_announcement_app';
// Custom URL mock to bypass validation errors for multi-host non-SRV replica list strings
const customDbUrl = {
    toString() {
        return env_1.default.mongodbUri;
    },
};
const sessionStorage = new shopify_app_session_storage_mongodb_1.MongoDBSessionStorage(customDbUrl, dbName, { sessionCollectionName: 'shopify_sessions' });
exports.shopify = (0, shopify_app_express_1.shopifyApp)({
    api: {
        apiVersion: shopify_api_1.ApiVersion.October24,
        apiKey: env_1.default.shopifyApiKey,
        apiSecretKey: env_1.default.shopifyApiSecret,
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
exports.default = exports.shopify;
