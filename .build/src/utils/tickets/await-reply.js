"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="a97035f0-3161-56c9-9303-027d47b904b2")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.awaitReply = awaitReply;
const __1 = require("../..");
const fetchMessage_1 = require("../bot/fetchMessage");
const getServer_1 = require("../bot/getServer");
const logger_1 = __importDefault(require("../logger"));
const lock_1 = require("./lock");
const close_1 = require("./close");
async function awaitReply(serverId, ticketId, action, notify) {
    logger_1.default.debug(`Running await-reply on ${ticketId}`);
    const ticket = await (0, getServer_1.getTicket)(ticketId, serverId);
    if (!ticket)
        return;
    const channel = await (0, fetchMessage_1.fetchChannelById)(__1.client, ticket.channel);
    if (!channel)
        return;
    if (ticket.status !== "Open")
        return channel
            .send("The await-reply action cannot run on this ticket as it is not open")
            .catch(() => { });
    const message = await channel
        .send("Running automation...")
        .catch(() => { });
    if (!message)
        return;
    if (action === "lock")
        await (0, lock_1.lockTicket)(ticketId, "en", message);
    if (action === "close")
        return await (0, close_1.closeTicket)(ticketId, "en", "User did not respond", message);
    if (notify)
        await channel.send(`<@${notify}>, the user has not responded`);
}
//# sourceMappingURL=/src/utils/tickets/await-reply.js.map
//# debugId=a97035f0-3161-56c9-9303-027d47b904b2
