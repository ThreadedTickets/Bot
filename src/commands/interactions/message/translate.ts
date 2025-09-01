import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  InteractionContextType,
  MessageFlags,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import { t } from "../../../lang";
import translate from "google-translate-api-x";
import colours from "../../../constants/colours";
import { onError } from "../../../utils/onError";

const command: AppCommand = {
  type: "message",
  testGuild: false,
  data: new ContextMenuCommandBuilder()
    .setName("Translate Message")
    .setNameLocalizations({})
    .setType(ApplicationCommandType.Message)
    .setContexts(InteractionContextType.Guild),
  execute: async (client, data, interaction) => {
    if (!interaction.guildId) return; // We already know this as the command can only be run in guilds but this just shuts ts up

    const lang = data.lang!;
    if (!interaction.targetMessage.content)
      return interaction.reply(
        (await onError(new Error("No content"))).discordMsg
      );
    interaction.reply({
      flags: [MessageFlags.Ephemeral],
      embeds: [
        {
          title: t(lang, "COMMANDS_TRANSLATE_MESSAGE_TRANSLATED"),
          color: parseInt(colours.success, 16),
          description: `\`\`\`\n${
            (
              await translate(interaction.targetMessage.content, {
                to: lang,
              })
            ).text
          }\n\`\`\``,
        },
      ],
    });
  },
};

export default command;
