"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = __importDefault(require("./config/env"));
const logger_1 = __importDefault(require("./config/logger"));
const errorHandler_1 = require("./middlewares/errorHandler");
const routes_1 = __importDefault(require("./routes"));
const shopifyApp_1 = __importDefault(require("./config/shopifyApp"));
// Initialize Express app
const app = (0, express_1.default)();
// Set up security headers
// Note: We need to adjust Content Security Policy (CSP) for Shopify embedded frame.
// Shopify App Bridge requires the app to allow loading inside iframes on admin.shopify.com and *.myshopify.com.
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            ...helmet_1.default.contentSecurityPolicy.getDefaultDirectives(),
            'frame-ancestors': [`https://*.myshopify.com`, `https://admin.shopify.com`, `https://*.shopify.com`],
        },
    },
}));
// Enable CORS for API requests
app.use((0, cors_1.default)());
// HTTP Request logging
const morganStream = {
    write: (message) => {
        logger_1.default.http(message.trim());
    },
};
app.use((0, morgan_1.default)('combined', {
    stream: morganStream,
    skip: (req) => req.url === '/health',
}));
// 1. Shopify OAuth and Webhook routes (MUST be declared before body parsers)
// Shopify OAuth endpoints (with validator for local dev outside Shopify admin)
app.get(shopifyApp_1.default.config.auth.path, (req, res, next) => {
    const shop = req.query.shop;
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
}, shopifyApp_1.default.auth.begin());
app.get(shopifyApp_1.default.config.auth.callbackPath, shopifyApp_1.default.auth.callback());
// Shopify Webhook endpoint (requires raw text body for verification)
app.post(shopifyApp_1.default.config.webhooks.path, express_1.default.text({ type: '*/*' }), shopifyApp_1.default.processWebhooks({ webhookHandlers: {} }));
// 2. Standard Body Parsing Middleware (JSON and urlencoded)
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// 3. API Routes
app.use('/api', routes_1.default);
// 4. Root Health Route
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Shopify Announcement Bar API is running',
        environment: env_1.default.NODE_ENV,
    });
});
// 5. 404 Route Handler
app.use((req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    next(error);
});
// 6. Global Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
