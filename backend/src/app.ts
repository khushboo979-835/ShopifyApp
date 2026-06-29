import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/env';
import logger from './config/logger';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';
import shopify from './config/shopifyApp';

// Initialize Express app
const app = express();

// Set up security headers
// Note: We need to adjust Content Security Policy (CSP) for Shopify embedded frame.
// Shopify App Bridge requires the app to allow loading inside iframes on admin.shopify.com and *.myshopify.com.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'frame-ancestors': [`https://*.myshopify.com`, `https://admin.shopify.com`, `https://*.shopify.com`],
      },
    },
  })
);

// Enable CORS for API requests
app.use(cors());

// HTTP Request logging
const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
app.use(
  morgan('combined', {
    stream: morganStream,
    skip: (req: any) => req.url === '/health',
  })
);

// 1. Shopify OAuth and Webhook routes (MUST be declared before body parsers)
// Shopify OAuth endpoints (with validator for local dev outside Shopify admin)
app.get(shopify.config.auth.path, (req, res, next) => {
  const shop = req.query.shop as string;
  if (!shop || shop === 'undefined' || !shop.match(/^[a-zA-Z0-9.-]+\.myshopify\.com$/)) {
    res.status(400).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shopify App - Installation Required</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background-color: #f6f6f7;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
              text-align: center;
              max-width: 480px;
              border: 1px solid #e1e3e5;
            }
            h2 { color: #1a1c1d; margin-top: 0; font-size: 20px; }
            p { color: #5c5f62; line-height: 1.5; font-size: 14px; margin-bottom: 24px; }
            .btn {
              background-color: #008060;
              color: white;
              border: none;
              padding: 10px 20px;
              font-size: 14px;
              font-weight: 600;
              border-radius: 4px;
              text-decoration: none;
              cursor: pointer;
            }
            .btn:hover { background-color: #006e52; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Shopify Embedded App</h2>
            <p>To configure your announcement bar, please access this app directly from your <strong>Shopify Admin Dashboard</strong> under the <strong>Apps</strong> menu.</p>
            <a href="https://partners.shopify.com" target="_blank" class="btn">Go to Shopify Partners</a>
          </div>
        </body>
      </html>
    `);
    return;
  }
  next();
}, shopify.auth.begin());
app.get(shopify.config.auth.callbackPath, shopify.auth.callback());

// Shopify Webhook endpoint (requires raw text body for verification)
app.post(
  shopify.config.webhooks.path,
  express.text({ type: '*/*' }),
  shopify.processWebhooks({ webhookHandlers: {} })
);

// 2. Standard Body Parsing Middleware (JSON and urlencoded)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. API Routes
app.use('/api', routes);

// 4. Root Health Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Shopify Announcement Bar API is running',
    environment: config.NODE_ENV,
  });
});

// 5. 404 Route Handler
app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`) as any;
  error.statusCode = 404;
  next(error);
});

// 6. Global Error Handler
app.use(errorHandler);

export default app;