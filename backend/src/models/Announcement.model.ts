import { Schema, model, Document } from 'mongoose';

/**
 * Interface representing the Announcement database document.
 */
export interface IAnnouncement extends Document {
  announcementText: string;
  shopDomain: string;
  createdAt: Date;
}

/**
 * Announcement Schema for tracking Shopify Announcement Bar changes.
 * Used for maintaining audit history of what banners were shown, when, and on which shop.
 */
const AnnouncementSchema = new Schema<IAnnouncement>({
  announcementText: {
    type: String,
    required: [true, 'Announcement text is required'],
    trim: true,
  },
  shopDomain: {
    type: String,
    required: [true, 'Shop domain is required'],
    trim: true,
    index: true, // Indexed to allow fast retrieval of history for a specific merchant store
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set when a new audit log entry is saved
    required: true,
  },
});

// Create and export the Mongoose model
export const Announcement = model<IAnnouncement>('Announcement', AnnouncementSchema);

export default Announcement;
