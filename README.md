# Shopify Announcement Bar App (MERN Stack)

A production-ready Shopify Embedded App built with the MERN stack (MongoDB, Express, React/Next.js, Node.js) and Shopify Polaris. This application enables merchants to customize an announcement banner inside their Shopify Admin panel, which then dynamically syncs to their storefront using Shopify Metafields and a Theme App Extension (App Embed Block).

---

## 🚀 Features

*   **Real Shopify OAuth**: Built-in authentication using Shopify's official `@shopify/shopify-app-express` library.
*   **Database Audit Trail**: Every announcement modification is persisted with timestamps in MongoDB to maintain a full history.
*   **Shopify Metafields Sync**: Integrates with the Shopify Admin GraphQL API (using the `metafieldsSet` mutation) to store announcement text in the shop metafield (`namespace: my_app`, `key: announcement`).
*   **Theme App Extension (App Embed Block)**: A Liquid-based App Embed Block that injects and styles the banner globally across all storefront pages without injecting hardcoded scripts.
*   **Development Sandbox Fallback**: Connects seamlessly to a local mock database sandbox when accessed directly outside of the Shopify iframe, making it incredibly simple to test, run, and record demo videos.

---

## 🛠️ Tech Stack

*   **Frontend**: React, Next.js, Shopify Polaris (UI library), Shopify App Bridge v4
*   **Backend**: Node.js, Express, TypeScript, Mongoose
*   **Database**: MongoDB (Mongoose schemas)
*   **Extension**: Liquid, HTML, CSS (Shopify Theme App Extension)

---

## 📁 File Structure

```
├── shopify.app.toml                    # Root-level Shopify CLI App Config
├── package.json                        # Root-level scripts (npm run dev / deploy)
├── backend/
│   ├── shopify.web.toml                # Backend process config for Shopify CLI
│   ├── package.json                    # Backend dependencies & scripts
│   ├── src/
│   │   ├── app.ts                      # Express app setup with Shopify OAuth/webhooks
│   │   ├── server.ts                   # Mongoose connection & server initialization
│   │   ├── config/
│   │   │   ├── env.ts                  # Safe environment variable validator
│   │   │   ├── database.ts             # Mongoose connection helper
│   │   │   └── shopifyApp.ts           # Initialize Shopify SDK & Session Storage
│   │   ├── controllers/
│   │   │   └── announcement.controller.ts # Route handlers (Shopify Session)
│   │   ├── services/
│   │   │   └── announcement.service.ts    # Metafield sync & DB services
│   │   └── models/
│   │       └── Announcement.model.ts      # Mongoose schema for announcement logs
├── frontend/
│   ├── shopify.web.toml                # Frontend process config for Shopify CLI
│   ├── package.json                    # Frontend dependencies & scripts
│   ├── next.config.js                  # Next.js config with backend proxy rewrites
│   ├── app/
│   │   ├── layout.tsx                  # Base layout injecting App Bridge CDN script
│   │   ├── page.tsx                    # Polaris announcement bar editor dashboard
│   │   └── globals.css                 # Global CSS styles
│   └── services/
│       ├── apiClient.ts                # Axios client injecting App Bridge JWT tokens
│       └── announcement.service.ts     # Frontend announcement API wrapper
└── extensions/
    └── theme-extension/                # Theme App Extension
        ├── shopify.extension.toml      # Theme Extension configuration
        └── blocks/
            └── announcement_banner.liquid # App Embed Block (injected into body tag)
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file inside the `backend` folder:

```env
# ==========================================
# Database Connection
# ==========================================
# Use standard replica list format to avoid local DNS SRV resolution issues (ECONNREFUSED)
MONGODB_URI=mongodb://<username>:<password>@ac-26mnogw-shard-00-00.lmmwm93.mongodb.net:27017,ac-26mnogw-shard-00-01.lmmwm93.mongodb.net:27017,ac-26mnogw-shard-00-02.lmmwm93.mongodb.net:27017/shopify_announcement_app?ssl=true&authSource=admin&retryWrites=true&w=majority

# ==========================================
# Shopify App Credentials (Link your Partners account)
# ==========================================
SHOPIFY_API_KEY=your_shopify_client_id
SHOPIFY_API_SECRET=your_shopify_client_secret
```

---

## 🚀 How to Run Locally

### 1. Install Dependencies
Run from the root workspace directory:
```bash
npm install
```

### 2. Start the App
Start both frontend and backend concurrently via Shopify CLI:
```bash
npm run dev
```

*This command starts the local database connection, launches the Cloudflare tunnel, and mounts the App Bridge editor page.*

---

## 📦 Deployment & Theme Activation

1. **Deploy Extension**: Build and release the theme extension to Shopify CDN:
   ```bash
   npm run deploy
   ```
2. **Enable App Embed**:
   * Navigate to your Shopify Development Store Admin.
   * Go to **Online Store** -> **Themes** -> **Customize** (on your active theme).
   * Click **App embeds** in the left menu.
   * Toggle the checkmark to **Enable** the `Announcement Banner` block and click **Save**.
