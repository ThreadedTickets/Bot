import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  GuildMember,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import { t } from "../../../lang";
import { TicketChannelManager } from "../../../utils/bot/TicketChannelManager";
import { getServerGroupsByIds, getTicket } from "../../../utils/bot/getServer";
import { onError } from "../../../utils/onError";
import { getUserPermissions } from "../../../utils/calculateUserPermissions";
import { sendDirectMessage } from "../../../utils/bot/sendDirectMessage";
import colours from "../../../constants/colours";
import { parseDurationToMs } from "../../../utils/formatters/duration";
import { TaskScheduler } from "../../..";
import logger from "../../../utils/logger";

const command: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("awaiting-reply")
    .setDescription("A friendly reminder to a user to respond to a ticket")
    .setContexts(InteractionContextType.Guild)
    .setNameLocalizations({})
    .setDescriptionLocalizations({})
    .addStringOption((o) =>
      o
        .setName("message")
        .setDescription("Attach a short message")
        .setMaxLength(250)
    )
    .addStringOption((o) =>
      o
        .setName("action")
        .setDescription("What action should be taken if there is no response?")
        .addChoices([
          {
            name: "Close the ticket",
            value: "close",
          },
          {
            name: "Lock the ticket",
            value: "lock",
          },
          {
            name: "Nothing (Default)",
            value: "nothing",
          },
        ])
    )
    .addStringOption((o) =>
      o
        .setName("time")
        .setDescription("How long should the user have to respond?")
        .addChoices([
          {
            name: "1 hour",
            value: "1h",
          },
          {
            name: "2 hours",
            value: "2h",
          },
          {
            name: "6 hours",
            value: "6h",
          },
          {
            name: "12 hours",
            value: "12h",
          },
          {
            name: "24 hours (Default)",
            value: "24h",
          },
          {
            name: "2 days",
            value: "48h",
          },
          {
            name: "3 days",
            value: "72h",
          },
        ])
    )
    .addStringOption((o) =>
      o
        .setName("notify")
        .setDescription("Do you want to be notified when the user responds?")
        .addChoices([
          {
            name: "Yes (Default)",
            value: "true",
          },
          {
            name: "No",
            value: "false",
          },
        ])
    ),

  async execute(client, data, interaction) {
    if (!interaction.guildId) return;
    await interaction.reply({
      content: t(data.lang!, "THINK"),
      flags: [MessageFlags.Ephemeral],
    });

    const ticketId = await new TicketChannelManager().getTicketId(
      interaction.channelId
    );
    if (!ticketId)
      return interaction.editReply(
        (
          await onError(new Error("Ticket not found"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );

    if (await TaskScheduler.taskExists(`AWAIT-${ticketId}`))
      return interaction.editReply({
        content: t(data.lang!, "TICKET_ALREADY_AWAITING"),
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId(`cancelAwait:${ticketId}`)
              .setLabel(t(data.lang!, "CANCEL"))
              .setStyle(ButtonStyle.Danger)
          ),
        ],
      });

    const ticket = await getTicket(ticketId, interaction.guildId);
    if (!ticket)
      return interaction.editReply(
        (
          await onError(new Error("Ticket not found"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );

    if (ticket.owner === interaction.user.id)
      return interaction.editReply({
        content: t(data.lang!, "NO_ACTION_SELF"),
      });

    if (ticket.status !== "Open")
      return interaction.editReply({
        content: t(data.lang!, "TICKET_NOT_OPEN"),
      });

    const userPermissions = getUserPermissions(
      interaction.member as GuildMember,
      await getServerGroupsByIds(ticket.groups, interaction.guildId)
    );

    const message = interaction.options.getString("message");
    const action: "lock" | "nothing" | "close" =
      (interaction.options.getString("action") as
        | "lock"
        | "nothing"
        | "close") || "nothing";
    const time = parseDurationToMs(
      interaction.options.getString("time") || "24h"
    );
    const futureTime = Math.round(
      new Date().setMilliseconds(new Date().getMilliseconds() + time) / 1000
    );
    const notify = interaction.options.getString("notify")
      ? interaction.options.getString("notify") === "true"
        ? interaction.user.id
        : null
      : interaction.user.id;

    if (
      ((action === "lock" && !userPermissions.tickets.canLock) ||
        (action === "close" && !userPermissions.tickets.canClose)) &&
      !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
    )
      return interaction.editReply(
        (
          await onError(new Error(`Missing ${action} permission`), {
            ticketId: ticketId,
          })
        ).discordMsg
      );

    const dm = await sendDirectMessage(client, ticket.owner, {
      embeds: [
        new EmbedBuilder()
          .setColor(parseInt(colours.primary, 16))
          .setDescription(
            `Hey! The support team in **${
              interaction.guild.name
            }** have responded to [your ticket](${
              interaction.channel.url
            }) and require a reply.${
              action !== "nothing"
                ? `\n-# If you do not respond <t:${futureTime}:R> then your ticket will be ${
                    action === "close" ? "closed" : "locked"
                  }.`
                : ""
            }`
          )
          .setFields(
            message
              ? [
                  {
                    name: "Message from support team",
                    value: `\`\`\`\n${message}\n\`\`\``,
                  },
                ]
              : []
          ),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setURL(interaction.channel.url)
            .setStyle(ButtonStyle.Link)
            .setLabel("Respond in ticket")
        ),
      ],
    });

    const dmSent = dm !== null;
    TaskScheduler.scheduleTask(
      "awaitingReply",
      { ticketId, action, notify, serverId: interaction.guildId },
      time,
      `AWAIT-${ticketId}`
    );
    logger.debug(`Scheduled await-reply task on ${ticketId}`);
    const msg = {
      content:
        t(data.lang!, "TICKET_AWAIT_REQUEST_DONE", {
          time: `<t:${futureTime}:R>`,
          action:
            action === "close"
              ? "closed"
              : action === "lock"
              ? "locked"
              : "ignored",
        }) + (dmSent ? "" : t(data.lang!, "UNABLE_TO_DM_TICKET_AWAIT")),
    };
    interaction.editReply(msg);

    interaction.channel.send({
      ...msg,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(`cancelAwait:${ticketId}`)
            .setLabel(t(data.lang!, "CANCEL"))
            .setStyle(ButtonStyle.Danger)
        ),
      ],
    });
  },
};

export default command;
