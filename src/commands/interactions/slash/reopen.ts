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
import { reopenTicket } from "../../../utils/tickets/reopen";

const command: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("reopen")
    .setDescription("Reopen the ticket")
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
          await onError(new Error("Ticket not found"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );
    const ticket = await getTicket(ticketId, interaction.guildId);
    if (!ticket)
      return interaction.reply(
        (
          await onError(new Error("Ticket not found"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );
    const userPermissions = getUserPermissions(
      interaction.member as GuildMember,
      await getServerGroupsByIds(ticket.groups, interaction.guildId)
    );

    if (
      !userPermissions.tickets.canClose &&
      !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
    )
      return interaction.reply(
        (
          await onError(new Error("Missing close permission"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );

    await interaction.reply({
      content: t(data.lang!, "THINK"),
      flags: [MessageFlags.Ephemeral],
    });

    await reopenTicket(ticketId, data.lang!, interaction);
  },
};

export default command;
