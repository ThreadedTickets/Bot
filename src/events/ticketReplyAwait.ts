import { TaskScheduler } from "..";
import { Event } from "../types/Event";
import { TicketChannelManager } from "../utils/bot/TicketChannelManager";
import logger from "../utils/logger";

const event: Event<"messageCreate"> = {
  name: "messageCreate",
  once: false,
  async execute(client, data, message) {
    if (!message.guildId) return;
    if (message.flags.has("Ephemeral")) return;

    const ticket = await new TicketChannelManager().getTicket(
      message.channelId
    );
    if (!ticket) return;
    if (message.author.id !== ticket.owner) return;

    const exists = await TaskScheduler.taskExists(
      `AWAIT-${ticket.ticketId}`,
      true
    );
    if (exists) {
      logger.debug("Canceling await task");
      TaskScheduler.removeTask(`AWAIT-${ticket.ticketId}`);
      if (exists.params.notify)
        message.reply({
          content: `<@${exists.params.notify}>\n-# Task canceled`,
          allowedMentions: { users: [exists.params.notify] },
        });
      else message.react("👀");
    }
  },
};

export default event;
