"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnnouncementHistory = exports.getLatestAnnouncement = exports.syncAnnouncementToShopify = void 0;
const Announcement_model_1 = require("../models/Announcement.model");
const errorHandler_1 = require("../middlewares/errorHandler");
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Syncs the active announcement text to the Shopify Admin GraphQL API as a Metafield.
 * Saves under the namespace 'my_app' and key 'announcement'.
 */
const syncAnnouncementToShopify = async (shopDomain, accessToken, announcementText) => {
    // Clean shop domain to prevent protocol prefix issues
    const cleanShop = shopDomain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    // Skip remote sync for dev/test mock stores to allow offline sandbox testing
    if (cleanShop.includes('test-development-shop') || accessToken.startsWith('mock-')) {
        logger_1.default.info(`✨ Local mock shop detected. Skipping remote Shopify API metafield sync.`);
        return;
    }
    logger_1.default.info(`🔄 Syncing announcement metafield to Shopify GraphQL API for: ${cleanShop}...`);
    const graphqlUrl = `https://${cleanShop}/admin/api/2024-10/graphql.json`;
    try {
        // 1. Fetch the global shop ID (ownerId)
        const shopQuery = {
            query: `
        query {
          shop {
            id
          }
        }
      `
        };
        const getShopResponse = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(shopQuery),
        });
        if (!getShopResponse.ok) {
            const errorMsg = `Failed to query shop ID: HTTP status ${getShopResponse.status}`;
            logger_1.default.error(`❌ Shopify Shop ID query failed: ${errorMsg}`);
            throw new errorHandler_1.AppError(errorMsg, getShopResponse.status);
        }
        const shopResult = await getShopResponse.json();
        const shopId = shopResult?.data?.shop?.id;
        if (!shopId) {
            const errorMsg = `Shop ID not found in query result: ${JSON.stringify(shopResult)}`;
            logger_1.default.error(`❌ ${errorMsg}`);
            throw new errorHandler_1.AppError(errorMsg, 400);
        }
        logger_1.default.info(`📡 Retrieved Shop GID: ${shopId}. Initiating metafieldsSet mutation...`);
        // 2. Perform the metafieldsSet mutation
        const metafieldMutation = {
            query: `
        mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields {
              id
              namespace
              key
              value
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
            variables: {
                metafields: [
                    {
                        ownerId: shopId,
                        namespace: "my_app",
                        key: "announcement",
                        type: "single_line_text_field",
                        value: announcementText,
                    }
                ]
            }
        };
        const setResponse = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(metafieldMutation),
        });
        if (!setResponse.ok) {
            const errorMsg = `Metafield mutation response HTTP ${setResponse.status}`;
            logger_1.default.error(`❌ Shopify GraphQL mutation failed: ${errorMsg}`);
            throw new errorHandler_1.AppError(errorMsg, setResponse.status);
        }
        const setResult = await setResponse.json();
        const userErrors = setResult?.data?.metafieldsSet?.userErrors;
        if (userErrors && userErrors.length > 0) {
            const errorMsg = `Shopify userErrors: ${JSON.stringify(userErrors)}`;
            logger_1.default.error(`❌ Metafield sync validation failed: ${errorMsg}`);
            throw new errorHandler_1.AppError(errorMsg, 400);
        }
        logger_1.default.info(`✅ Successfully synced metafield via GraphQL for ${cleanShop}.`);
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError)
            throw error;
        logger_1.default.error(`❌ GraphQL error while syncing with Shopify for ${cleanShop}: ${error.message}`);
        throw new errorHandler_1.AppError(`Shopify GraphQL Connection Error: ${error.message}`, 502);
    }
};
exports.syncAnnouncementToShopify = syncAnnouncementToShopify;
/**
 * Retrieve the latest active announcement for a shop domain.
 */
const getLatestAnnouncement = async (shopDomain) => {
    const cleanShop = shopDomain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    return Announcement_model_1.Announcement.findOne({ shopDomain: cleanShop }).sort({ createdAt: -1 });
};
exports.getLatestAnnouncement = getLatestAnnouncement;
/**
 * Retrieve a paginated list of historical announcements for audit logs.
 */
const getAnnouncementHistory = async (shopDomain, page = 1, limit = 10) => {
    const cleanShop = shopDomain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    const skip = (page - 1) * limit;
    const [history, total] = await Promise.all([
        Announcement_model_1.Announcement.find({ shopDomain: cleanShop }).skip(skip).limit(limit).sort({ createdAt: -1 }),
        Announcement_model_1.Announcement.countDocuments({ shopDomain: cleanShop }),
    ]);
    return {
        history,
        total,
    };
};
exports.getAnnouncementHistory = getAnnouncementHistory;
