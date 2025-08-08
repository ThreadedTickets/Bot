"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="51935b21-2ad1-561a-b47f-ed7199c445ee")}catch(e){}}();

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
        writer.editMessage(old.id, message);
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
//# sourceMappingURL=/src/events/writeEditsToTranscripts.js.map
//# debugId=51935b21-2ad1-561a-b47f-ed7199c445ee
