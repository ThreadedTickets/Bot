import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  MessageFlags,
} from "discord.js";
import { AppCommand } from "../../../types/Command";

const command: AppCommand = {
  type: "user",
  testGuild: true,
  data: new ContextMenuCommandBuilder()
    .setName("Inspect User")
    .setType(ApplicationCommandType.User),
  execute: async (client, data, interaction) => {
    await interaction.reply({
      content: `${interaction.targetUser.tag} was inspected.`,
      flags: [MessageFlags.Ephemeral],
    });
  },
};

export default command;
