import {
  ActionRowBuilder,
  GuildMember,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
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
      !userPermissions.tickets.canCloseIfOwn &&
      interaction.user.id === ticket.owner &&
      !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
    )
      return interaction.reply(
        (
          await onError(new Error("Missing close-own permission"), {
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
          await onError(new Error("Missing close permission"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );

    interaction.showModal(
      new ModalBuilder()
        .setTitle("Close Ticket")
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
          ),
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("reason")
              .setLabel("Reason")
              .setMaxLength(100)
              .setPlaceholder(`Why are you closing this ticket?`)
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
          )
        )
    );
  },
};

export default button;
