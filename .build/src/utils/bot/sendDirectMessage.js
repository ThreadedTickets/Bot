"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDirectMessage = sendDirectMessage;
const logger_1 = __importDefault(require("../logger"));
/**
 * Sends a DM to a user by their ID with full message options.
 * @param client - The Discord Client instance.
 * @param userId - The user ID to DM.
 * @param message - The message content or options (string, embeds, etc).
 * @returns The sent message or null if failed.
 */
async function sendDirectMessage(client, userId, message) {
    try {
        const user = await client.users.fetch(userId);
        if (!user)
            throw new Error("User not found");
        const sent = await user.send(message);
        return sent;
    }
    catch (err) {
        logger_1.default.warn(`Failed to DM user ${userId}`, err);
        return null;
    }
}
//# sourceMappingURL=/src/utils/bot/sendDirectMessage.js.map