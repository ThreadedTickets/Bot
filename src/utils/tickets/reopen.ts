import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  TextChannel,
} from "discord.js";
import { client, TaskScheduler } from "../..";
import { t } from "../../lang";
import { Locale } from "../../types/Locale";
import { TicketSchema } from "../../database/modals/Ticket";
import { getServer, getServerGroupsByIds } from "../bot/getServer";
import {
  getAvailableLogChannel,
  postLogToWebhook,
} from "../bot/sendLogToWebhook";
import colours from "../../constants/colours";
import { fetchChannelById } from "../bot/fetchMessage";
import { onError } from "../onError";
import { invalidateCache } from "../database/invalidateCache";
import { buildChannelPermissionOverwrites } from "../hooks/events/tickets/new/main";
import everyoneTicketPermissions from "../../constants/everyoneTicketPermissions";
import botTicketPermissions from "../../constants/botTicketPermissions";
import ticketOwnerPermissions from "../../constants/ticketOwnerPermissions";
import { updateMemberRoles } from "../hooks/events/applications/end/roles";
import { getGuildMember } from "../bot/getGuildMember";
import logger from "../logger";

export async function reopenTicket(
  ticketId: string,
  locale: Locale,
  repliable: ButtonInteraction | ChatInputCommandInteraction
) {
  const ticket = await TicketSchema.findOneAndUpdate(
    { _id: ticketId },
    {
      status: "Open",
    },
    {
      new: false,
    }
  );
  await invalidateCache(`ticket:${ticketId}`);
  if (!ticket)
    return repliable?.editReply(
      (
        await onError(new Error("Could not find ticket"), {
          ticketId: ticketId,
        })
      ).discordMsg
    );
  invalidateCache(`tickets:${ticket.server}:${ticket.owner}:Open`);
  invalidateCache(`tickets:${ticket.server}:Open`);
  if (!ticket.allowReopening)
    return repliable?.editReply(t(locale, "REOPEN_NOT_SUPPORTED"));
  if (ticket.status === "Open")
    return repliable?.editReply(t(locale, "TICKET_ALREADY_OPEN"));

  const ticketChannel = await fetchChannelById(client, ticket.channel);
  const member = await getGuildMember(client, ticket.server, ticket.owner);

  if (member)
    updateMemberRoles(
      client,
      member,
      [...ticket.removeRolesOnClose, ...ticket.addRolesOnOpen],
      [...ticket.addRolesOnClose, ...ticket.removeRolesOnOpen]
    );

  const server = await getServer(ticket.server);
  const logChannel = getAvailableLogChannel(
    server.settings.logging,
    "tickets.open"
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
            title: t(server.preferredLanguage, "TICKET_REOPEN_LOG_TITLE"),
            description: t(server.preferredLanguage, `TICKET_REOPEN_LOG_BODY`, {
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
        logger.warn(`Failed to edit ticket channel on reopen`, err)
      );
  }

  TaskScheduler.removeTask(`CLOSE-${ticketId}`);
  repliable?.editReply(t(locale, "TICKET_REOPEN"));

  if (ticketChannel?.isTextBased())
    (ticketChannel as TextChannel)
      .send({
        content: t(locale, "TICKET_REOPEN"),
      })
      .catch((err) =>
        logger.warn(`Failed to send message to ticket channel on reopen`, err)
      );
  else if (ticketChannel?.isThread()) {
    await ticketChannel.members
      .add(ticket.owner)
      .catch((err) => logger.warn(`Failed to add ticket owner on reopen`, err));
  }
}
