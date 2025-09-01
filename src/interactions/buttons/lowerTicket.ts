import { GuildMember, MessageFlags, PermissionFlagsBits } from "discord.js";
import { t } from "../../lang";
import { ButtonHandler } from "../../types/Interactions";
import { getUserPermissions } from "../../utils/calculateUserPermissions";
import { getServerGroupsByIds, getTicket } from "../../utils/bot/getServer";
import { onError } from "../../utils/onError";
import { lowerTicket } from "../../utils/tickets/lower";

const button: ButtonHandler = {
  customId: "lower",
  async execute(client, data, interaction) {
    if (!interaction.guildId) return;
    await interaction.reply({
      content: t(data.lang!, "THINK"),
      flags: [MessageFlags.Ephemeral],
    });

    const ticketId = interaction.customId.split(":")[1];
    const ticket = await getTicket(ticketId, interaction.guildId);
    if (!ticket)
      return interaction.editReply(
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
      !userPermissions.tickets.canUnlock &&
      !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
    )
      return interaction.editReply(
        (
          await onError(new Error("Missing unlock permission"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );

    await lowerTicket(ticketId, data.lang!, interaction);
  },
};

export default button;
