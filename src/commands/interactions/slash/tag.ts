import {
  Channel,
  GuildMember,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import {
  getServerMessage,
  getServerTag,
  getServerTags,
} from "../../../utils/bot/getServer";
import { onError } from "../../../utils/onError";
import { t } from "../../../lang";
import { resolveDiscordMessagePlaceholders } from "../../../utils/message/placeholders/resolvePlaceholders";
import serverMessageToDiscordMessage from "../../../utils/formatters/serverMessageToDiscordMessage";
import { generateBasePlaceholderContext } from "../../../utils/message/placeholders/generateBaseContext";

const command: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("tag")
    .setDescription("Send a tag")
    .setContexts(InteractionContextType.Guild)
    .setNameLocalizations({})
    .setDescriptionLocalizations({})
    .addStringOption((opt) =>
      opt
        .setName("tag")
        .setDescription("Which tag do you want to send?")
        .setRequired(true)
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("preview")
        .setDescription("Do you want to preview this tag rather than send it?")
        .setChoices([
          { name: "Yes", value: "true" },
          { name: "No", value: "false" },
        ])
    ),

  async autocomplete(client, interaction) {
    if (!interaction.guildId) return;
    const focused = interaction.options.getFocused(true).name;

    if (focused === "tag") {
      const focusedValue = interaction.options.getString("tag", true);
      const tags = await getServerTags(interaction.guildId);
      if (!tags.length) {
        interaction.respond([
          {
            name: "You don't have any tags!",
            value: "",
          },
        ]);
        return;
      }

      const filtered = tags.filter((m) =>
        m.name.toLowerCase().includes(focusedValue.toLowerCase())
      );

      interaction.respond(
        filtered
          .map((m) => ({
            name: m.name,
            value: m._id,
          }))
          .slice(0, 25)
      );
    }
  },

  async execute(client, data, interaction) {
    if (!interaction.guildId) return;
    const showPreview = interaction.options.getString("preview") === "true";
    const tagId = interaction.options.getString("tag", true);
    const lang = data.lang!;

    const tag = await getServerTag(tagId, interaction.guildId);
    if (!tag)
      return interaction.reply(
        (await onError("Commands", t(lang, "TAG_NOT_FOUND"))).discordMsg
      );

    const message = await getServerMessage(tag.message, interaction.guildId);
    if (!message)
      return interaction.reply(
        (await onError("Commands", t(lang, "TAG_MESSAGE_NOT_FOUND"))).discordMsg
      );

    interaction.reply({
      flags: showPreview ? [MessageFlags.Ephemeral] : [],
      ...resolveDiscordMessagePlaceholders(
        serverMessageToDiscordMessage(message),
        generateBasePlaceholderContext({
          server: interaction.guild!,
          user: interaction.user,
          member: interaction.member as GuildMember,
          channel: interaction.channel as Channel,
        })
      ),
    });
  },
};

export default command;
