"use strict";
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