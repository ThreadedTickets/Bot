import {
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import { setServerLocale } from "../../../utils/bot/getServer";
import { t } from "../../../lang";
import { supportedLocales } from "../../../constants/locales";
import { Locale } from "../../../types/Locale";
const localeMap = supportedLocales as Record<
  string,
  { name: string; emoji: string }
>;
const languages = Object.keys(localeMap).map((k) => ({
  name: `${localeMap[k].emoji} ${localeMap[k].name}`,
  value: k,
}));

const command: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("language")
    .setDescription("Set the preferred language for your server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild)
    .setNameLocalizations({})
    .setDescriptionLocalizations({})
    .addStringOption((opt) =>
      opt
        .setName("value")
        .setDescription("Chose a supported language")
        .setRequired(true)
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .addChoices(languages)
    ),

  async execute(client, data, interaction) {
    if (!interaction.guildId) return;

    const newLanguage = interaction.options.getString("value", true);
    setServerLocale(interaction.guildId, newLanguage as Locale);

    interaction.reply({
      flags: [MessageFlags.Ephemeral],
      content: t(newLanguage, "LANGUAGE_UPDATED", {
        new_language: localeMap[newLanguage].name,
      }),
    });
  },
};

export default command;
