import { Event } from "../types/Event";
import { TicketChannelManager } from "../utils/bot/TicketChannelManager";
import { TranscriptWriter } from "../utils/tickets/TranscriptManager";

const event: Event<"messageCreate"> = {
  name: "messageCreate",
  async execute(client, data, message) {
    if (!message.guildId) return;
    if (message.flags.has("Ephemeral")) return;

    const ticket = await new TicketChannelManager().getTicket(
      message.channelId
    );
    if (!ticket?.takeTranscript) return;

    const writer = new TranscriptWriter(ticket.ticketId, ticket.anonymise);
    writer.appendMessage(message);

    if (message.mentions.channels) {
      for (const channel of message.mentions.channels.values()) {
        writer.setMeta(
          `channels.${channel.id}`,
          "name" in channel ? channel.name : "Unknown Channel"
        );
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

export default event;
