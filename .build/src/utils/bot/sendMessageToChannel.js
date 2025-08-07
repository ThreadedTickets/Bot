"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="88eb7842-82bd-5ba0-b436-39f7814aa831")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageToChannel = sendMessageToChannel;
const logger_1 = __importDefault(require("../logger"));
async function sendMessageToChannel(client, guildId, channelId, message) {
    try {
        const guild = await client.guilds.fetch(guildId);
        if (!guild)
            throw new Error("Guild not found");
        const channel = await guild.channels.fetch(channelId);
        if (!channel)
            throw new Error("Channel not found");
        if (!channel.isTextBased())
            throw new Error("Channel is not a text channel");
        const msg = await channel.send(typeof message === "string" ? { content: message } : message);
        logger_1.default.debug(`Message sent to channel (${guildId}-${channelId}): ${msg.id}`);
        return msg;
    }
    catch (err) {
        logger_1.default.warn(`Failed to send message to channel`, err);
    }
}
//# sourceMappingURL=sendMessageToChannel.js.map
//# debugId=88eb7842-82bd-5ba0-b436-39f7814aa831
