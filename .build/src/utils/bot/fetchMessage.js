"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMessageFromUrl = fetchMessageFromUrl;
exports.fetchChannelById = fetchChannelById;
exports.fetchGuildById = fetchGuildById;
const logger_1 = __importDefault(require("../logger"));
/**
 * Fetches a message from a Discord message URL.
 * @param client - The Discord Client instance.
 * @param url - The full Discord message URL.
 * @returns The fetched message, or null if not found or invalid.
 */
async function fetchMessageFromUrl(client, url) {
    const match = url.match(/https:\/\/(?:canary\.|ptb\.)?discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/);
    if (!match) {
        logger_1.default.error("Invalid Discord message URL", { url: url });
        return null;
    }
    const [, guildId, channelId, messageId] = match;
    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel?.isTextBased())
            return null;
        const message = await channel.messages.fetch(messageId);
        return message;
    }
    catch (err) {
        logger_1.default.error("Failed to fetch message:", err);
        return null;
    }
}
async function fetchChannelById(client, channelId) {
    if (!channelId)
        return null;
    try {
        const channel = await client.channels.fetch(channelId);
        return channel ?? null;
    }
    catch (err) {
        return null; // Handle invalid ID, missing permissions, or deleted channels
    }
}
async function fetchGuildById(client, guildId) {
    try {
        const guild = await client.guilds.fetch(guildId);
        return guild; // This is a Guild object
    }
    catch (error) {
        logger_1.default.error(`Failed to fetch guild`, error);
        return null;
    }
}
//# sourceMappingURL=/src/utils/bot/fetchMessage.js.map