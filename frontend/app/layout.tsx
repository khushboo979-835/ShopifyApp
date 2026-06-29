import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shopify Announcement Bar Manager',
  description: 'Shopify Announcement Bar Embedded App',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Inject the Shopify API client ID metadata for App Bridge v4 */}
        <meta name="shopify-api-key" content={process.env.NEXT_PUBLIC_SHOPIFY_API_KEY} />
      </head>
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        {/* Load the official Shopify App Bridge v4 script */}
        <Script
          src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
          strategy="beforeInteractive"
        />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}