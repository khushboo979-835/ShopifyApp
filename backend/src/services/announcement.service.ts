import { Announcement, IAnnouncement } from '../models/Announcement.model';
import { AppError } from '../middlewares/errorHandler';
import logger from '../config/logger';

/**
 * Syncs the active announcement text to the Shopify Admin GraphQL API as a Metafield.
 * Saves under the namespace 'my_app' and key 'announcement'.
 */
export const syncAnnouncementToShopify = async (
  shopDomain: string,
  accessToken: string,
  announcementText: string
): Promise<void> => {
  // Clean shop domain to prevent protocol prefix issues
  const cleanShop = shopDomain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];

  // Skip remote sync for dev/test mock stores to allow offline sandbox testing
  if (cleanShop.includes('test-development-shop') || accessToken.startsWith('mock-')) {
    logger.info(`✨ Local mock shop detected. Skipping remote Shopify API metafield sync.`);
    return;
  }
  
  logger.info(`🔄 Syncing announcement metafield to Shopify GraphQL API for: ${cleanShop}...`);

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
      logger.error(`❌ Shopify Shop ID query failed: ${errorMsg}`);
      throw new AppError(errorMsg, getShopResponse.status);
    }

    const shopResult = await getShopResponse.json() as any;
    const shopId = shopResult?.data?.shop?.id;

    if (!shopId) {
      const errorMsg = `Shop ID not found in query result: ${JSON.stringify(shopResult)}`;
      logger.error(`❌ ${errorMsg}`);
      throw new AppError(errorMsg, 400);
    }

    logger.info(`📡 Retrieved Shop GID: ${shopId}. Initiating metafieldsSet mutation...`);

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
      logger.error(`❌ Shopify GraphQL mutation failed: ${errorMsg}`);
      throw new AppError(errorMsg, setResponse.status);
    }

    const setResult = await setResponse.json() as any;
    const userErrors = setResult?.data?.metafieldsSet?.userErrors;

    if (userErrors && userErrors.length > 0) {
      const errorMsg = `Shopify userErrors: ${JSON.stringify(userErrors)}`;
      logger.error(`❌ Metafield sync validation failed: ${errorMsg}`);
      throw new AppError(errorMsg, 400);
    }

    logger.info(`✅ Successfully synced metafield via GraphQL for ${cleanShop}.`);
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    logger.error(`❌ GraphQL error while syncing with Shopify for ${cleanShop}: ${error.message}`);
    throw new AppError(`Shopify GraphQL Connection Error: ${error.message}`, 502);
  }
};

/**
 * Retrieve the latest active announcement for a shop domain.
 */
export const getLatestAnnouncement = async (shopDomain: string): Promise<IAnnouncement | null> => {
  const cleanShop = shopDomain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  return Announcement.findOne({ shopDomain: cleanShop }).sort({ createdAt: -1 });
};

/**
 * Retrieve a paginated list of historical announcements for audit logs.
 */
export const getAnnouncementHistory = async (
  shopDomain: string,
  page: number = 1,
  limit: number = 10
): Promise<{ history: IAnnouncement[]; total: number }> => {
  const cleanShop = shopDomain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([
    Announcement.find({ shopDomain: cleanShop }).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Announcement.countDocuments({ shopDomain: cleanShop }),
  ]);

  return {
    history,
    total,
  };
};
