"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Announcement = void 0;
const mongoose_1 = require("mongoose");
/**
 * Announcement Schema for tracking Shopify Announcement Bar changes.
 * Used for maintaining audit history of what banners were shown, when, and on which shop.
 */
const AnnouncementSchema = new mongoose_1.Schema({
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
exports.Announcement = (0, mongoose_1.model)('Announcement', AnnouncementSchema);
exports.default = exports.Announcement;
