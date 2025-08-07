import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
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
import { onError } from "../onError";
import { buildChannelPermissionOverwrites } from "../hooks/events/tickets/new/main";
import ticketOwnerPermissionsClosed from "../../constants/ticketOwnerPermissionsClosed";
import everyoneTicketPermissions from "../../constants/everyoneTicketPermissions";
import botTicketPermissions from "../../constants/botTicketPermissions";
import { TicketSchema } from "../../database/modals/Ticket";
import { invalidateCache } from "../database/invalidateCache";
import logger from "../logger";

export async function lockTicket(
  ticketId: string,
  locale: Locale,
  repliable: ButtonInteraction | ChatInputCommandInteraction
) {
  const ticket = await getTicketTrust(ticketId);
  if (!ticket)
    return repliable?.editReply(
      (
        await onError(new Error("Could not find ticket"), {
          ticketId: ticketId,
        })
      ).discordMsg
    );
  if (ticket.status === "Closed")
    return repliable?.editReply(t(locale, "TICKET_CLOSED_SO_CANNOT_LOCK"));
  if (ticket.status === "Locked")
    return repliable?.editReply(t(locale, "TICKET_LOCKED_SO_CANNOT_LOCK"));

  await TicketSchema.findOneAndUpdate({ _id: ticketId }, { status: "Locked" });
  await invalidateCache(`ticket:${ticketId}`);
  await invalidateCache(`ticketTrust:${ticketId}`);
  invalidateCache(`tickets:${ticket.server}:${ticket.owner}:Open`);
  invalidateCache(`tickets:${ticket.server}:Open`);

  const ticketChannel = await fetchChannelById(client, ticket.channel);

  const server = await getServer(ticket.server);
  const logChannel = getAvailableLogChannel(
    server.settings.logging,
    "tickets.lock"
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
            title: t(server.preferredLanguage, "TICKET_LOCK_LOG_TITLE"),
            description: t(server.preferredLanguage, `TICKET_LOCK_LOG_BODY`, {
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
          { id: ticket.owner, ...ticketOwnerPermissionsClosed },
          everyoneTicketPermissions,
          { id: client.user!.id, ...botTicketPermissions }
        ),
      })
      .catch((err) =>
        logger.warn(`Failed to edit ticket channel on lock`, err)
      );
  } else if (ticketChannel.isThread()) {
    await ticketChannel.members
      .remove(ticket.owner)
      .catch((err) =>
        logger.warn(`Failed to remove ticket owner on lock`, err)
      );
  }

  repliable?.editReply(t(locale, "TICKET_LOCK"));

  if (ticketChannel?.isTextBased())
    (ticketChannel as TextChannel)
      .send({
        content: t(locale, "TICKET_LOCK"),
        components: [
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId(`unlock:${ticketId}`)
              .setStyle(ButtonStyle.Primary)
              .setLabel(t(locale, "TICKET_PIN_MESSAGE_COMPONENTS_UNLOCK"))
          ),
        ],
      })
      .catch((err) =>
        logger.warn(`Failed to send message to ticket channel on lock`, err)
      );
}
