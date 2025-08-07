import { Event } from "../types/Event";
import { TicketChannelManager } from "../utils/bot/TicketChannelManager";
import logger from "../utils/logger";
import { closeTicket } from "../utils/tickets/close";

const event: Event<"channelDelete"> = {
  name: "channelDelete",
  async execute(client, data, channel) {
    const isTicketChannel = await new TicketChannelManager().isTicketChannel(
      channel.id
    );
    if (!isTicketChannel) return;

    const ticket = await new TicketChannelManager().getTicketId(channel.id);

    logger.debug(`Channel ${channel.id} deleted, closing ticket ${ticket}`);
    closeTicket(ticket!, data?.lang ?? "en");
  },
};

export default event;
