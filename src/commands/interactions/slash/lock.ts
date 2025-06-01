import {
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
import { lockTicket } from "../../../utils/tickets/lock";

const command: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock the ticket")
    .setContexts(InteractionContextType.Guild)
    .setNameLocalizations({})
    .setDescriptionLocalizations({}),

  async execute(client, data, interaction) {
    if (!interaction.guildId) return;
    const ticketId = await new TicketChannelManager().getTicketId(
      interaction.channelId
    );
    if (!ticketId)
      return interaction.reply(
        (
          await onError("Tickets", t(data.lang!, "TICKET_NOT_FOUND"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );
    const ticket = await getTicket(ticketId, interaction.guildId);
    if (!ticket)
      return interaction.reply(
        (
          await onError("Tickets", t(data.lang!, "TICKET_NOT_FOUND"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );
    const userPermissions = getUserPermissions(
      interaction.member as GuildMember,
      await getServerGroupsByIds(ticket.groups, interaction.guildId)
    );

    if (
      !userPermissions.tickets.canLock &&
      !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
    )
      return interaction.reply(
        (
          await onError("Tickets", t(data.lang!, "MISSING_PERMISSIONS"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );

    await interaction.reply({
      content: t(data.lang!, "THINK"),
      flags: [MessageFlags.Ephemeral],
    });

    await lockTicket(ticketId, data.lang!, interaction);
  },
};

export default command;
