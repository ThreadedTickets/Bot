import { TextChannel } from "discord.js";
import { client } from "../..";
import { fetchChannelById } from "../bot/fetchMessage";
import { getTicket } from "../bot/getServer";
import logger from "../logger";
import { lockTicket } from "./lock";
import { closeTicket } from "./close";
import isGuildOnShard from "../getGuildShard";

export async function awaitReply(
  serverId: string,
  ticketId: string,
  action: "nothing" | "lock" | "close",
  notify: string | null
) {
  if (!isGuildOnShard(serverId)) return;
  logger.debug(`Running await-reply on ${ticketId}`);
  const ticket = await getTicket(ticketId, serverId);
  if (!ticket) return;

  const channel = await fetchChannelById(client, ticket.channel);
  if (!channel) return;

  if (ticket.status !== "Open")
    return (channel as TextChannel)
      .send(
        "The await-reply action cannot run on this ticket as it is not open"
      )
      .catch(() => {});

  const message = await (channel as TextChannel)
    .send("Running automation...")
    .catch(() => {});
  if (!message) return;

  if (action === "lock") await lockTicket(ticketId, "en", message);
  if (action === "close")
    return await closeTicket(ticketId, "en", "User did not respond", message);

  if (notify)
    await (channel as TextChannel).send(
      `<@${notify}>, the user has not responded`
    );
}
