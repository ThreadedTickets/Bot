import {
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import { getAnnouncement } from "../../../utils/bot/viewAnnouncement";
import { t } from "../../../lang";
import { getServerLocale } from "../../../utils/bot/getServer";

const command: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("update")
    .setDescription("Get the latest update from the developers")
    .setNameLocalizations({})
    .setDescriptionLocalizations({}),

  async execute(client, data, interaction) {
    const announcement = await getAnnouncement();

    if (!announcement)
      return interaction.reply({
        flags: [MessageFlags.Ephemeral],
        content: t(
          interaction.guildId
            ? await getServerLocale(interaction.guildId)
            : "en",
          "NO_ANNOUNCEMENT"
        ),
      });

    interaction.reply({
      flags: [MessageFlags.Ephemeral],
      ...JSON.parse(announcement),
    });
  },
};

export default command;
