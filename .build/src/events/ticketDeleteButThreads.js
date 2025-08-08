"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="c28ccdac-4fa4-5015-9a0c-d5b2cb21f121")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TicketChannelManager_1 = require("../utils/bot/TicketChannelManager");
const logger_1 = __importDefault(require("../utils/logger"));
const close_1 = require("../utils/tickets/close");
const event = {
    name: "threadDelete",
    async execute(client, data, channel) {
        const isTicketChannel = await new TicketChannelManager_1.TicketChannelManager().isTicketChannel(channel.id);
        if (!isTicketChannel)
            return;
        const ticket = await new TicketChannelManager_1.TicketChannelManager().getTicketId(channel.id);
        logger_1.default.debug(`Thread ${channel.id} deleted, closing ticket ${ticket}`);
        (0, close_1.closeTicket)(ticket, data?.lang ?? "en");
    },
};
exports.default = event;
//# sourceMappingURL=/src/events/ticketDeleteButThreads.js.map
//# debugId=c28ccdac-4fa4-5015-9a0c-d5b2cb21f121
