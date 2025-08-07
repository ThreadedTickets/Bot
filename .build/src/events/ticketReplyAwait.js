"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="03048be6-eff3-5c71-af03-1cc3c57c72de")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const TicketChannelManager_1 = require("../utils/bot/TicketChannelManager");
const logger_1 = __importDefault(require("../utils/logger"));
const event = {
    name: "messageCreate",
    once: false,
    async execute(client, data, message) {
        if (!message.guildId)
            return;
        if (message.flags.has("Ephemeral"))
            return;
        const ticket = await new TicketChannelManager_1.TicketChannelManager().getTicket(message.channelId);
        if (!ticket)
            return;
        if (message.author.id !== ticket.owner)
            return;
        const exists = await __1.TaskScheduler.taskExists(`AWAIT-${ticket.ticketId}`, true);
        if (exists) {
            logger_1.default.debug("Canceling await task");
            __1.TaskScheduler.removeTask(`AWAIT-${ticket.ticketId}`);
            if (exists.params.notify)
                message.reply({
                    content: `<@${exists.params.notify}>\n-# Task canceled`,
                    allowedMentions: { users: [exists.params.notify] },
                });
            else
                message.react("👀");
        }
    },
};
exports.default = event;
//# sourceMappingURL=ticketReplyAwait.js.map
//# debugId=03048be6-eff3-5c71-af03-1cc3c57c72de
