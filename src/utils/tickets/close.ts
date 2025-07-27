import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  TextChannel,
} from "discord.js";
import { client, TaskScheduler } from "../..";
import { formatDuration, parseDurationToMs } from "../formatters/duration";
import { t } from "../../lang";
import { Locale } from "../../types/Locale";
import { TicketSchema } from "../../database/modals/Ticket";
import {
  getServer,
  getServerGroupsByIds,
  getServerMessage,
} from "../bot/getServer";
import {
  getAvailableLogChannel,
  postLogToWebhook,
} from "../bot/sendLogToWebhook";
import colours from "../../constants/colours";
import { fetchChannelById, fetchGuildById } from "../bot/fetchMessage";
import { logger } from "../logger";
import { TicketChannelManager } from "../bot/TicketChannelManager";
import { onError } from "../onError";
import { invalidateCache } from "../database/invalidateCache";
import { buildChannelPermissionOverwrites } from "../hooks/events/tickets/new/main";
import ticketOwnerPermissionsClosed from "../../constants/ticketOwnerPermissionsClosed";
import everyoneTicketPermissions from "../../constants/everyoneTicketPermissions";
import botTicketPermissions from "../../constants/botTicketPermissions";
import { updateMemberRoles } from "../hooks/events/applications/end/roles";
import { getGuildMember } from "../bot/getGuildMember";
import { TranscriptWriter } from "./TranscriptManager";
import { renderTranscriptFromJsonl } from "./render";
import fs from "fs";
import path from "path";
import serverMessageToDiscordMessage from "../formatters/serverMessageToDiscordMessage";
import { resolveDiscordMessagePlaceholders } from "../message/placeholders/resolvePlaceholders";
import { generateBasePlaceholderContext } from "../message/placeholders/generateBaseContext";

export async function closeTicket(
  ticketId: string,
  locale: Locale,
  reason?: string,
  repliable?: ModalSubmitInteraction | ChatInputCommandInteraction,
  schedule?: string | null
) {
  const ticket = await TicketSchema.findOneAndUpdate(
    { _id: ticketId },
    {
      status: "Closed",
      deletedAt: new Date(),
      closeReason: reason || "No reason provided",
    },
    {
      new: false,
    }
  );
  await invalidateCache(`ticket:${ticketId}`);
  if (!ticket)
    return repliable?.editReply(
      (
        await onError("Tickets", t(locale, "TICKET_NOT_FOUND"), {
          ticketId: ticketId,
        })
      ).discordMsg
    );
  if (ticket.status === "Closed" && repliable)
    return repliable?.editReply(t(locale, "SCHEDULE_TICKET_CLOSE_ALREADY"));
  if (repliable) {
    const member = await getGuildMember(client, ticket.server, ticket.owner);

    if (member)
      updateMemberRoles(
        client,
        member,
        ticket.addRolesOnClose,
        ticket.removeRolesOnClose
      );
  }

  const ticketChannel = await fetchChannelById(client, ticket.channel);
  const server = await getServer(ticket.server);

  if (schedule) {
    const logChannel = getAvailableLogChannel(
      server.settings.logging,
      "tickets.close"
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
              title: t(server.preferredLanguage, "TICKET_CLOSE_LOG_TITLE"),
              description: t(
                server.preferredLanguage,
                `TICKET_CLOSE_LOG_BODY`,
                {
                  user: `<@${ticket.owner}>`,
                  id: ticketId,
                  reason: reason || "No reason provided",
                }
              ),
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
          ...(ticket.closeChannel ? { parent: ticket.closeChannel } : {}),
        })
        .catch((err) =>
          logger(
            "Tickets",
            "Warn",
            `Failed to edit ticket channel on close: ${err}`
          )
        );
    }
    const ms = parseDurationToMs(schedule);
    const formattedDuration = formatDuration(ms);
    TaskScheduler.scheduleTask(
      "closeTicket",
      { ticketId, locale, reason },
      ms,
      `CLOSE-${ticketId}`
    );
    repliable?.editReply(
      t(locale, "SCHEDULE_TICKET_CLOSE", { duration: formattedDuration })
    );

    if (ticketChannel?.isTextBased())
      (ticketChannel as TextChannel)
        .send({
          content: t(locale, "TICKET_CLOSE_REOPEN_MESSAGE", {
            duration: formattedDuration,
          }),
          components: [
            new ActionRowBuilder<ButtonBuilder>().setComponents(
              new ButtonBuilder()
                .setCustomId(`reopen:${ticketId}`)
                .setStyle(ButtonStyle.Primary)
                .setLabel(t(locale, "TICKET_PIN_MESSAGE_COMPONENTS_REOPEN"))
                .setDisabled(!ticket.allowReopening)
            ),
          ],
        })
        .catch((err) =>
          logger(
            "Tickets",
            "Warn",
            `Failed to send message to ticket channel: ${err}`
          )
        );
    else if (ticketChannel?.isThread()) {
      await ticketChannel.members
        .remove(ticket.owner)
        .catch((err) =>
          logger("Tickets", "Warn", `Failed to remove ticket owner: ${err}`)
        );
    }
    return;
  }

  if (ticket.takeTranscripts) {
    const writer = new TranscriptWriter(ticketId);
    writer.setMeta("name", ticketId);
    const html = await renderTranscriptFromJsonl(
      writer.getFilePath(),
      writer.getMeta().users,
      writer.getMeta().metadata
    );

    const transcriptPath = path.join(
      process.cwd(),
      "transcripts",
      `${ticket.isRaised ? "LOCKED_" : ""}${ticketId}.html`
    );
    fs.writeFileSync(transcriptPath, html);
    writer.deleteTranscript();

    const logChannel = getAvailableLogChannel(
      server.settings.logging,
      "tickets.transcripts"
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
              title: t(
                server.preferredLanguage,
                "TICKET_CLOSE_WITH_TRANSCRIPT_LOG_TITLE"
              ),
              description: t(
                server.preferredLanguage,
                `TICKET_CLOSE_WITH_TRANSCRIPT_LOG_BODY`,
                {
                  user: `<@${ticket.owner}>`,
                  id: ticketId,
                  reason: reason || "No reason provided",
                }
              ),
            },
          ],
          files: [transcriptPath],
        }
      );
  }

  await new TicketChannelManager().remove(ticket.channel);
  invalidateCache(`tickets:${ticket.server}:${ticket.owner}:Open`);
  invalidateCache(`tickets:${ticket.server}:Open`);

  if (ticketChannel) {
    await ticketChannel
      .delete("Deleting old ticket channel")
      .catch((err) =>
        logger("Tickets", "Warn", `Failed to delete ticket channel: ${err}`)
      );
  }

  if (ticket.dmOnClose) {
    const owner = await getGuildMember(client, ticket.server, ticket.owner);
    const message = await getServerMessage(ticket.dmOnClose, ticket.server);
    const guild = await fetchGuildById(client, ticket.server);
    if (owner && message && guild) {
      owner.send({
        components: [
          new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setURL(process.env["DISCORD_APPLICATION_INVITE"]!)
                .setStyle(ButtonStyle.Link)
                .setLabel(t(locale, "TICKET_CLOSE_DM_BUTTON"))
            )
            .toJSON(),
        ],
        ...resolveDiscordMessagePlaceholders(
          serverMessageToDiscordMessage(message),
          generateBasePlaceholderContext({
            server: guild,
          })
        ),
      });
    }
  }
}
