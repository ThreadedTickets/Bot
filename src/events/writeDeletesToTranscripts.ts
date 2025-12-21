import { Event } from "../types/Event";
import { TicketChannelManager } from "../utils/bot/TicketChannelManager";
import { transcriptWriterManager } from "../utils/tickets/TranscriptManager";

const event: Event<"messageDelete"> = {
  name: "messageDelete",
  async execute(client, data, message) {
    if (!message.guildId) return;
    if (message.flags.has("Ephemeral")) return;

    const ticket = await new TicketChannelManager().getTicket(message.channelId);
    if (!ticket?.takeTranscript) return;

    const writer = transcriptWriterManager.get(ticket.ticketId, ticket.anonymise);
    writer.deleteMessage(message.id);
  },
};

export default event;
