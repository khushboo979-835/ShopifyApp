export interface Announcement {
  _id: string;
  announcementText: string;
  shopDomain: string;
  createdAt: string;
}

export interface AnnouncementHistoryResponse {
  history: Announcement[];
  total: number;
}
