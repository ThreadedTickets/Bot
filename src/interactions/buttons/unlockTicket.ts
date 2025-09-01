import { GuildMember, MessageFlags, PermissionFlagsBits } from "discord.js";
import { t } from "../../lang";
import { ButtonHandler } from "../../types/Interactions";
import { getUserPermissions } from "../../utils/calculateUserPermissions";
import { getServerGroupsByIds, getTicket } from "../../utils/bot/getServer";
import { onError } from "../../utils/onError";
import { unlockTicket } from "../../utils/tickets/unlock";

const button: ButtonHandler = {
  customId: "unlock",
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
            channel: interaction.channelId,
            guild: interaction.guildId,
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
      return interaction.editReply(
        (
          await onError(new Error("Missing unlock permission"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );

    await unlockTicket(ticketId, data.lang!, interaction);
  },
};

export default button;
