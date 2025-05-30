import {
  ActionRowBuilder,
  GuildMember,
  MessageFlags,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { t } from "../../lang";
import { ButtonHandler } from "../../types/Interactions";
import { getUserPermissions } from "../../utils/calculateUserPermissions";
import { getServerGroupsByIds, getTicket } from "../../utils/bot/getServer";
import { onError } from "../../utils/onError";

const button: ButtonHandler = {
  customId: "close",
  async execute(client, data, interaction) {
    if (!interaction.guildId) return;
    const ticketId = interaction.customId.split(":")[1];
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
      !userPermissions.tickets.canCloseIfOwn &&
      interaction.user.id === ticket.owner &&
      !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
    )
      return interaction.reply(
        (
          await onError("Tickets", t(data.lang!, "NO_CLOSE_OWN_TICKET"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );

    if (
      !userPermissions.tickets.canClose &&
      !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
    )
      return interaction.reply(
        (
          await onError("Tickets", t(data.lang!, "MISSING_PERMISSIONS"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );

    interaction.showModal(
      new ModalBuilder()
        .setTitle("Schedule closure")
        .setCustomId(`close:${ticketId}`)
        .addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("duration")
              .setLabel("Duration (10mins)")
              .setMaxLength(100)
              .setPlaceholder(`Leave blank to close instantly`)
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
          )
        )
    );
  },
};

export default button;
