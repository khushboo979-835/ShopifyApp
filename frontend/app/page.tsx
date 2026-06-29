'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { announcementService } from '@/services/announcement.service';
import { Announcement } from '@/types/announcement.types';
import toast from 'react-hot-toast';

import {
  AppProvider,
  Page,
  Layout,
  Card,
  TextField,
  Button,
  BlockStack,
  InlineStack,
  Text,
  DataTable,
  Badge,
} from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';

export default function RootPage() {
  const [mounted, setMounted] = useState(false);

  // Announcement and preview state
  const [announcementText, setAnnouncementText] = useState('');
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);

  // Loading indicators
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Audit Logs pagination states
  const [history, setHistory] = useState<Announcement[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLimit] = useState(5);

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch active announcement and history log
  const fetchActiveAndHistory = useCallback(async (page: number) => {
    try {
      setIsLoadingData(true);
      const activeData = await announcementService.getActive();
      setActiveAnnouncement(activeData);
      setAnnouncementText(activeData?.announcementText || '');

      const historyData = await announcementService.getHistory(page, historyLimit);
      setHistory(historyData.history);
      setHistoryTotal(historyData.total);
    } catch (error: any) {
      console.error('Error fetching announcement information:', error);
      toast.error('Failed to load announcement details from server.');
    } finally {
      setIsLoadingData(false);
    }
  }, [historyLimit]);

  // Load backend details once mounted or page changes
  useEffect(() => {
    if (mounted) {
      fetchActiveAndHistory(historyPage);
    }
  }, [mounted, historyPage, fetchActiveAndHistory]);

  // Submit updated announcement
  const handleSaveAnnouncement = async () => {
    if (!announcementText.trim()) {
      toast.error('Announcement text cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await announcementService.update(announcementText.trim());
      setActiveAnnouncement(updated);
      toast.success('Announcement synced to Shopify Storefront successfully!');

      // Force refresh audit history from page 1
      const historyData = await announcementService.getHistory(1, historyLimit);
      setHistory(historyData.history);
      setHistoryTotal(historyData.total);
      setHistoryPage(1);
    } catch (error: any) {
      const apiError = error.response?.data?.message || error.message || 'Sync update failed';
      toast.error(apiError);
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  // Format dataset for Polaris DataTable
  const historyRows = history.map((log) => [
    new Date(log.createdAt).toLocaleString(),
    log.announcementText,
    log.shopDomain,
    <Badge key={log._id} tone="success" progress="complete">Synced</Badge>,
  ]);

  return (
    <AppProvider i18n={enTranslations}>
      <Page title="Shopify Announcement Bar Manager">
        <Layout>
          {/* Live Storefront Mock Preview */}
          <Layout.Section>
            <Card>
              <div className="p-4">
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">Live Storefront Preview</Text>
                  <div
                    className="w-full py-3 px-4 text-center text-sm font-semibold rounded-lg shadow-inner overflow-hidden transition-all duration-300"
                    style={{
                      backgroundColor: '#1b1b1f',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {announcementText || 'Your announcement banner text will appear here...'}
                  </div>
                </BlockStack>
              </div>
            </Card>
          </Layout.Section>

          {/* Configuration panel */}
          <Layout.Section>
            <Card>
              <div className="p-4">
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Configure Active Banner</Text>

                  <TextField
                    label="Announcement Bar Text"
                    value={announcementText}
                    onChange={(val) => setAnnouncementText(val)}
                    placeholder="E.g., Special Weekend Offer: Buy 1 Get 1 Free!"
                    autoComplete="off"
                    disabled={isSaving}
                  />

                  {activeAnnouncement && (
                    <Text as="p" tone="subdued">
                      Last storefront sync: {new Date(activeAnnouncement.createdAt).toLocaleString()}
                    </Text>
                  )}

                  <InlineStack align="end">
                    <Button
                      variant="primary"
                      onClick={handleSaveAnnouncement}
                      loading={isSaving}
                    >
                      Save & Sync Storefront
                    </Button>
                  </InlineStack>
                </BlockStack>
              </div>
            </Card>
          </Layout.Section>

          {/* Database History Table */}
          <Layout.Section>
            <Card>
              <div className="p-4">
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">Database Audit Logs (MongoDB)</Text>

                  {isLoadingData ? (
                    <div className="flex justify-center items-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent"></div>
                    </div>
                  ) : history.length > 0 ? (
                    <div className="overflow-x-auto">
                      <DataTable
                        columnContentTypes={['text', 'text', 'text', 'text']}
                        headings={['Timestamp', 'Announcement Text', 'Shop Domain', 'Sync Status']}
                        rows={historyRows}
                      />

                      {historyTotal > historyLimit && (
                        <div className="mt-4 flex justify-between items-center px-4">
                          <Text as="span" tone="subdued">
                            Showing page {historyPage} of {Math.ceil(historyTotal / historyLimit)} ({historyTotal} logs total)
                          </Text>
                          <InlineStack gap="200">
                            <Button
                              disabled={historyPage === 1}
                              onClick={() => setHistoryPage((p) => Math.max(p - 1, 1))}
                            >
                              Previous
                            </Button>
                            <Button
                              disabled={historyPage >= Math.ceil(historyTotal / historyLimit)}
                              onClick={() => setHistoryPage((p) => p + 1)}
                            >
                              Next
                            </Button>
                          </InlineStack>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Text as="p" tone="subdued">No announcement modification logs found for this shop.</Text>
                  )}
                </BlockStack>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </AppProvider>
  );
}
