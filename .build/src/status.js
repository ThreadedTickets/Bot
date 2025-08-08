"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="12081df4-22dc-54e7-a36d-7aea6242f601")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setBotStatusFromEnv;
const discord_js_1 = require("discord.js");
/**
 * Sets the bot's status based on environment variables.
 * Only sets what's provided in the environment.
 * @param {Client} client - The Discord.js client instance
 */
function setBotStatusFromEnv(client) {
    const presenceData = {
        status: ["online", "idle", "dnd", "invisible"].includes(process.env.BOT_STATUS)
            ? process.env.BOT_STATUS
            : "online",
    };
    // Only set activity if both type and text are provided
    if (process.env.BOT_ACTIVITY_TYPE && process.env.BOT_ACTIVITY_TEXT) {
        const activityType = process.env.BOT_ACTIVITY_TYPE.toUpperCase();
        const activity = {
            name: process.env.BOT_ACTIVITY_TEXT,
            type: discord_js_1.ActivityType[activityType] ??
                discord_js_1.ActivityType.Playing,
        };
        // Add URL if provided and activity is streaming
        if (activity.type === discord_js_1.ActivityType.Streaming &&
            process.env.BOT_ACTIVITY_URL) {
            activity.url = process.env.BOT_ACTIVITY_URL;
        }
        presenceData.activities = [activity];
    }
    if (client.user)
        client.user.setPresence(presenceData);
}
//# sourceMappingURL=/src/status.js.map
//# debugId=12081df4-22dc-54e7-a36d-7aea6242f601
