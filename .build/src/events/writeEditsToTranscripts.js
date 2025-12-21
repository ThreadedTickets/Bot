"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TicketChannelManager_1 = require("../utils/bot/TicketChannelManager");
const TranscriptManager_1 = require("../utils/tickets/TranscriptManager");
const event = {
    name: "messageUpdate",
    async execute(client, data, old, message) {
        if (!message.guildId)
            return;
        if (message.flags.has("Ephemeral"))
            return;
        const ticket = await new TicketChannelManager_1.TicketChannelManager().getTicket(message.channelId);
        if (!ticket?.takeTranscript)
            return;
        const writer = TranscriptManager_1.transcriptWriterManager.get(ticket.ticketId, ticket.anonymise);
        writer.editMessage(message);
    },
};
exports.default = event;
//# sourceMappingURL=/src/events/writeEditsToTranscripts.js.map