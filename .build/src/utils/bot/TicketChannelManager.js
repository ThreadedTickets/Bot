"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketChannelManager = void 0;
const config_1 = __importDefault(require("../../config"));
const redis_1 = __importDefault(require("../redis"));
class TicketChannelManager {
    constructor() {
        this.key = `${config_1.default.redis.prefix}tickets:channels`; // Redis set key for storing all ticket channel IDs
        this.prefix = `${config_1.default.redis.prefix}tickets:channel:`; // Prefix for channel-specific keys
        this.redis = redis_1.default;
    }
    /**
     * Adds a ticket channel to Redis.
     */
    async add(channelId, ticketId, takeTranscript, anonymise, allowAutoresponders, owner) {
        await this.redis.sadd(this.key, channelId);
        await this.redis.set(`${this.prefix}${channelId}`, JSON.stringify({
            ticketId,
            takeTranscript,
            anonymise,
            allowAutoresponders,
            owner,
        }));
    }
    /**
     * Removes a ticket channel from Redis.
     */
    async remove(channelId) {
        await this.redis.srem(this.key, channelId);
        await this.redis.del(`${this.prefix}${channelId}`);
    }
    /**
     * Checks if a channel is a managed ticket channel.
     */
    async isTicketChannel(channelId) {
        return (await this.redis.sismember(this.key, channelId)) === 1;
    }
    /**
     * Returns the ticket ID for a given channel ID, or null if not found.
     */
    async getTicketId(channelId) {
        const data = await this.redis.get(`${this.prefix}${channelId}`);
        return data ? JSON.parse(data).ticketId : null;
    }
    async getTicket(channelId) {
        const data = await this.redis.get(`${this.prefix}${channelId}`);
        return data ? JSON.parse(data) : null;
    }
    /**
     * Gets all channel IDs currently tracked.
     */
    async getAllChannels() {
        return await this.redis.smembers(this.key);
    }
}
exports.TicketChannelManager = TicketChannelManager;
//# sourceMappingURL=/src/utils/bot/TicketChannelManager.js.map