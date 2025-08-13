"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TicketChannelManager_1 = require("../utils/bot/TicketChannelManager");
const TranscriptManager_1 = require("../utils/tickets/TranscriptManager");
const event = {
    name: "messageCreate",
    async execute(client, data, message) {
        if (!message.guildId)
            return;
        if (message.flags.has("Ephemeral"))
            return;
        const ticket = await new TicketChannelManager_1.TicketChannelManager().getTicket(message.channelId);
        if (!ticket?.takeTranscript)
            return;
        const writer = TranscriptManager_1.transcriptWriterManager.get(ticket.ticketId, ticket.anonymise);
        writer.appendMessage(message);
        if (message.mentions.channels) {
            for (const channel of message.mentions.channels.values()) {
                writer.setMeta(`channels.${channel.id}`, "name" in channel ? channel.name : "Unknown Channel");
            }
        }
        if (message.mentions.users) {
            for (const user of message.mentions.users.values()) {
                writer.setMeta(`users.${user.id}`, user.username);
            }
        }
        if (message.mentions.roles) {
            for (const role of message.mentions.roles.values()) {
                writer.setMeta(`roles.${role.id}`, role.name);
            }
        }
    },
};
exports.default = event;
//# sourceMappingURL=/src/events/writeCreateToTranscripts.js.map