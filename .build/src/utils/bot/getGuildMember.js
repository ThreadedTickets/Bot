"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="113cedcf-3547-5384-8a94-fae27ace7cf6")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuildMember = getGuildMember;
const logger_1 = __importDefault(require("../logger"));
async function getGuildMember(client, guildId, userId) {
    try {
        const guild = await client.guilds.fetch(guildId);
        if (!guild)
            throw new Error("Guild not found");
        const member = await guild.members.fetch(userId);
        return member;
    }
    catch (error) {
        logger_1.default.warn(`Failed to fetch member ${userId} in guild ${guildId}`, error);
        return null;
    }
}
//# sourceMappingURL=/src/utils/bot/getGuildMember.js.map
//# debugId=113cedcf-3547-5384-8a94-fae27ace7cf6
