import {
  ApplicationCommandAutocompleteStringOption,
  ApplicationCommandOptionChoiceData,
  CategoryChannel,
  ChannelType,
  GuildMember,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import { t } from "../../../lang";
import {
  getServerGroupsByIds,
  getTicket,
  getTickets,
  getTicketTrust,
} from "../../../utils/bot/getServer";
import { onError } from "../../../utils/onError";
import { getUserPermissions } from "../../../utils/calculateUserPermissions";
import path from "path";
import fs from "fs";
import { formatDate } from "../../../utils/formatters/date";
import { TicketChannelManager } from "../../../utils/bot/TicketChannelManager";
import { fetchChannelById } from "../../../utils/bot/fetchMessage";
import { buildChannelPermissionOverwrites } from "../../../utils/hooks/events/tickets/new/main";
import ticketOwnerPermissions from "../../../constants/ticketOwnerPermissions";
import ticketOwnerPermissionsClosed from "../../../constants/ticketOwnerPermissionsClosed";
import everyoneTicketPermissions from "../../../constants/everyoneTicketPermissions";
import botTicketPermissions from "../../../constants/botTicketPermissions";

const command: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("move")
    .setDescription("Move this ticket")
    .setContexts(InteractionContextType.Guild)
    .setNameLocalizations({})
    .setDescriptionLocalizations({})
    .addStringOption((opt) =>
      opt
        .setName("channel")
        .setDescription("The channel to move this ticket to")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(client, interaction) {
    if (!interaction.guildId) return;
    const focused = interaction.options.getFocused(true).name;

    if (focused === "channel") {
      const focusedValue = interaction.options.getString("channel", true);
      const ticketId = await new TicketChannelManager().getTicketId(
        interaction.channelId
      );
      if (!ticketId) {
        interaction.respond([
          {
            name: "This is not a ticket that can be moved",
            value: "",
          },
        ]);
        return;
      }

      const ticket = await getTicketTrust(ticketId);
      const channels = await Promise.all(
        ticket!.categoriesAvailableToMoveTicketsTo
          .map(async (c) => await fetchChannelById(client, c))
          .filter(async (c) => (await c)?.type === ChannelType.GuildCategory)
      );
      if (!channels.length) {
        interaction.respond([
          {
            name: "No channels available",
            value: "",
          },
        ]);
        return;
      }

      const filtered = channels.filter((c) =>
        (c as CategoryChannel).name
          .toLowerCase()
          .includes(focusedValue.toLowerCase())
      );

      const map = filtered
        .map((c) => ({
          name: (c as CategoryChannel).name.slice(0, 100) ?? "Unknown",
          value: (c as CategoryChannel).id,
        }))
        .slice(0, 25);
      interaction.respond(map);
    }
  },

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
          await onError("Tickets", t(data.lang!, "TICKET_NOT_FOUND"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );

    const ticket = await getTicketTrust(ticketId);
    if (!ticket)
      return interaction.editReply(
        (
          await onError("Tickets", t(data.lang!, "TICKET_NOT_FOUND"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );
    const ticketChannel = interaction.channel!;
    if (ticketChannel.isThread() || !ticketChannel.isTextBased())
      return interaction.editReply(
        (
          await onError("Tickets", t(data.lang!, "TICKET_CANT_MOVE"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );

    const userPermissions = getUserPermissions(
      interaction.member as GuildMember,
      await getServerGroupsByIds(ticket.groups, interaction.guildId)
    );

    if (
      !userPermissions.tickets.canMove &&
      !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
    )
      return interaction.editReply(
        (
          await onError("Tickets", t(data.lang!, "MISSING_PERMISSIONS"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );

    const newParentId = interaction.options.getString("channel", true);
    const newParent = await fetchChannelById(client, newParentId);

    if (!newParent || newParent?.type !== ChannelType.GuildCategory)
      return interaction.editReply(
        (
          await onError("Tickets", t(data.lang!, "INVALID_CHANNEL"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );

    (ticketChannel as TextChannel)
      .edit({ parent: newParent.id })
      .then(async () => {
        if (ticket.syncChannelPermissionsWhenMoved) {
          (ticketChannel as TextChannel).edit({
            permissionOverwrites: [
              ...newParent.permissionOverwrites.cache.map((overwrite) => {
                return {
                  id: overwrite.id,
                  type: overwrite.type,
                  allow: overwrite.allow.toArray(),
                  deny: overwrite.deny.toArray(),
                };
              }),
              ...buildChannelPermissionOverwrites(
                [],
                interaction.guildId!,
                {
                  id: ticket.owner,
                  ...(ticket.status === "Open"
                    ? ticketOwnerPermissions
                    : ticketOwnerPermissionsClosed),
                },
                everyoneTicketPermissions,
                { id: client.user!.id, ...botTicketPermissions }
              ),
            ].slice(0, 100),
          });
        }
      });

    interaction.editReply({
      content: t(data.lang!, "TICKET_MOVED"),
    });
  },
};

export default command;
