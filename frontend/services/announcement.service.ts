import apiClient from './apiClient';
import { Announcement, AnnouncementHistoryResponse } from '@/types/announcement.types';

/**
 * Service to manage Shopify Announcement Bar updates, sync, and audit history logs.
 */
export const announcementService = {
  /**
   * Fetch the current active announcement for the authenticated merchant's store.
   */
  getActive: async (): Promise<Announcement> => {
    const response = await apiClient.get<{ data: Announcement }>('/announcements/active');
    return response.data.data;
  },

  /**
   * Create/update the announcement text, logging it in MongoDB and syncing it to the Shopify Storefront metafields.
   */
  update: async (announcementText: string): Promise<Announcement> => {
    const response = await apiClient.post<{ data: Announcement }>('/announcements', {
      announcementText,
    });
    return response.data.data;
  },

  /**
   * Fetch the paginated audit logs history for the store.
   */
  getHistory: async (page: number = 1, limit: number = 10): Promise<AnnouncementHistoryResponse> => {
    const response = await apiClient.get<{ data: AnnouncementHistoryResponse }>('/announcements/history', {
      params: { page, limit },
    });
    return response.data.data;
  },
};
