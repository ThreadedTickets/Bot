import { TextInputBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ModalBuilder, TextInputStyle } from "discord.js";

export function generateReasonModal(customId: string, required: boolean) {
  return new ModalBuilder()
    .setTitle("Type a reason")
    .setCustomId(customId)
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("reason")
          .setLabel("Reason")
          .setMaxLength(100)
          .setPlaceholder(
            required ? "Give a reason" : "Press submit to leave blank"
          )
          .setRequired(required)
          .setStyle(TextInputStyle.Short)
      )
    );
}
