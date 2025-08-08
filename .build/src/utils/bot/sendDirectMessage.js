"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="572a06f5-113e-5766-9692-5758298c9685")}catch(e){}}();

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
//# debugId=572a06f5-113e-5766-9692-5758298c9685
