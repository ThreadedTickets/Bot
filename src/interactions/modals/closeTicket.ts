import { MessageFlags } from "discord.js";
import { t } from "../../lang";
import { ModalHandler } from "../../types/Interactions";
import { closeTicket } from "../../utils/tickets/close";

const modal: ModalHandler = {
  customId: "close",
  async execute(client, data, interaction) {
    if (!interaction.guildId) return;
    await interaction.reply({
      content: t(data.lang!, "THINK"),
      flags: [MessageFlags.Ephemeral],
    });

    const ticketId = interaction.customId.split(":")[1];
    const duration = interaction.fields.getTextInputValue("duration") || null;

    await closeTicket(ticketId, data.lang!, interaction, duration);
  },
};

export default modal;
