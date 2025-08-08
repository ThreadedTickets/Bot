"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="5d0609f8-4c81-5aa7-8e79-b0b92880e5d9")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewAnnouncement = viewAnnouncement;
exports.getAnnouncement = getAnnouncement;
exports.countAnnouncementViews = countAnnouncementViews;
exports.hasUserViewedAnnouncement = hasUserViewedAnnouncement;
const redis_1 = __importDefault(require("../redis"));
async function viewAnnouncement(userId) {
    const announcementKey = "announcement";
    const viewedSetKey = "announcement:viewed";
    // Check if announcement exists
    const announcement = await redis_1.default.get(announcementKey);
    if (!announcement)
        return false;
    // Check if user has already viewed the announcement
    const hasViewed = await redis_1.default.sismember(viewedSetKey, userId);
    if (hasViewed)
        return false;
    // Mark as viewed
    await redis_1.default.sadd(viewedSetKey, userId);
    return JSON.parse(announcement); // assuming it's stored as JSON
}
async function getAnnouncement() {
    const announcementKey = "announcement";
    const announcement = await redis_1.default.get(announcementKey);
    if (!announcement)
        return null;
    return announcement;
}
async function countAnnouncementViews() {
    return await redis_1.default.scard("announcement:viewed");
}
async function hasUserViewedAnnouncement(userId) {
    return await redis_1.default
        .sismember("announcement:viewed", userId)
        .then((res) => res === 1);
}
//# sourceMappingURL=/src/utils/bot/viewAnnouncement.js.map
//# debugId=5d0609f8-4c81-5aa7-8e79-b0b92880e5d9
