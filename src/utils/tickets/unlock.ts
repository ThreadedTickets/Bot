import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  TextChannel,
} from "discord.js";
import { client } from "../..";
import { t } from "../../lang";
import { Locale } from "../../types/Locale";
import {
  getServer,
  getServerGroupsByIds,
  getTicketTrust,
} from "../bot/getServer";
import {
  getAvailableLogChannel,
  postLogToWebhook,
} from "../bot/sendLogToWebhook";
import colours from "../../constants/colours";
import { fetchChannelById } from "../bot/fetchMessage";
import { logger } from "../logger";
import { onError } from "../onError";
import { buildChannelPermissionOverwrites } from "../hooks/events/tickets/new/main";
import ticketOwnerPermissionsClosed from "../../constants/ticketOwnerPermissionsClosed";
import everyoneTicketPermissions from "../../constants/everyoneTicketPermissions";
import botTicketPermissions from "../../constants/botTicketPermissions";
import { TicketSchema } from "../../database/modals/Ticket";
import { invalidateCache } from "../database/invalidateCache";
import ticketOwnerPermissions from "../../constants/ticketOwnerPermissions";

export async function unlockTicket(
  ticketId: string,
  locale: Locale,
  repliable: ButtonInteraction | ChatInputCommandInteraction
) {
  const ticket = await getTicketTrust(ticketId);
  if (!ticket)
    return repliable?.editReply(
      (
        await onError("Tickets", t(locale, "TICKET_NOT_FOUND"), {
          ticketId: ticketId,
        })
      ).discordMsg
    );
  invalidateCache(`tickets:${ticket.server}:${ticket.owner}:Open`);
  invalidateCache(`tickets:${ticket.server}:Open`);
  if (ticket.status !== "Locked")
    return repliable?.editReply(t(locale, "TICKET_NOT_LOCKED"));

  await TicketSchema.findOneAndUpdate({ _id: ticketId }, { status: "Open" });
  await invalidateCache(`ticket:${ticketId}`);
  await invalidateCache(`ticketTrust:${ticketId}`);

  const ticketChannel = await fetchChannelById(client, ticket.channel);
  const server = await getServer(ticket.server);
  const logChannel = getAvailableLogChannel(
    server.settings.logging,
    "tickets.unlock"
  );
  if (logChannel)
    await postLogToWebhook(
      client,
      {
        channel: logChannel.channel!,
        enabled: logChannel.enabled,
        webhook: logChannel.webhook!,
      },
      {
        embeds: [
          {
            color: parseInt(colours.info, 16),
            title: t(server.preferredLanguage, "TICKET_UNLOCK_LOG_TITLE"),
            description: t(server.preferredLanguage, `TICKET_UNLOCK_LOG_BODY`, {
              user: `<@${ticket.owner}>`,
            }),
          },
        ],
      }
    );

  if (!ticketChannel?.isThread()) {
    await (ticketChannel as TextChannel)
      .edit({
        permissionOverwrites: buildChannelPermissionOverwrites(
          await getServerGroupsByIds(ticket.groups, ticket.server),
          ticket.server,
          { id: ticket.owner, ...ticketOwnerPermissions },
          everyoneTicketPermissions,
          { id: client.user!.id, ...botTicketPermissions }
        ),
      })
      .catch((err) =>
        logger(
          "Tickets",
          "Warn",
          `Failed to edit ticket channel on unlock: ${err}`
        )
      );
  } else if (ticketChannel?.isThread()) {
    await ticketChannel.members
      .add(ticket.owner)
      .catch((err) =>
        logger("Tickets", "Warn", `Failed to add ticket owner: ${err}`)
      );
  }

  repliable?.editReply(t(locale, "TICKET_UNLOCK"));

  if (ticketChannel?.isTextBased())
    (ticketChannel as TextChannel)
      .send({
        content: t(locale, "TICKET_UNLOCK"),
      })
      .catch((err) =>
        logger(
          "Tickets",
          "Warn",
          `Failed to send message to ticket channel: ${err}`
        )
      );
}
