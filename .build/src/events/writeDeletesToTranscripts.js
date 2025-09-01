"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="ffe7813d-3d1f-5bfb-bc22-dac2e4659e58")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const TicketChannelManager_1 = require("../utils/bot/TicketChannelManager");
const TranscriptManager_1 = require("../utils/tickets/TranscriptManager");
const event = {
    name: "messageDelete",
    async execute(client, data, message) {
        if (!message.guildId)
            return;
        if (message.flags.has("Ephemeral"))
            return;
        const ticket = await new TicketChannelManager_1.TicketChannelManager().getTicket(message.channelId);
        if (!ticket?.takeTranscript)
            return;
        const writer = TranscriptManager_1.transcriptWriterManager.get(ticket.ticketId, ticket.anonymise);
        message.content = "MESSAGE DELETED";
        message.embeds = [];
        message.type = null;
        writer.editMessage(message.id, message);
    },
};
exports.default = event;
//# sourceMappingURL=/src/events/writeDeletesToTranscripts.js.map
//# debugId=ffe7813d-3d1f-5bfb-bc22-dac2e4659e58
