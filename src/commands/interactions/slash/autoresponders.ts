import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  GuildMember,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import {
  getServer,
  getServerGroups,
  getServerMessage,
  getServerResponder,
  getServerResponders,
} from "../../../utils/bot/getServer";
import { t } from "../../../lang";
import { getUserPermissions } from "../../../utils/calculateUserPermissions";
import { onError } from "../../../utils/onError";
import { Locale } from "../../../types/Locale";
import limits from "../../../constants/limits";
import { generateId } from "../../../utils/database/generateId";
import {
  generateExampleRegex,
  validateUserRegex,
} from "../../../utils/formatters/validateRegex";
import { updateCachedData } from "../../../utils/database/updateCache";
import { toTimeUnit } from "../../../utils/formatters/toTimeUnit";
import colours from "../../../constants/colours";
import { AutoResponderSchema } from "../../../database/modals/AutoResponder";
import { invalidateCache } from "../../../utils/database/invalidateCache";
import { InMemoryCache } from "../../..";

const cmd: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("autoresponders")
    .setDescription("Auto Responder configuration base")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild)
    .addSubcommand((cmd) =>
      cmd
        .setName("view")
        .setDescription("View an auto responder")
        .addStringOption((opt) =>
          opt
            .setName("responder")
            .setDescription("Select an auto responder")
            .setAutocomplete(true)
            .setRequired(true)
        )
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("allowed_channels")
        .setDescription(
          "Set the channels that auto responders are able to respond in"
        )
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("new")
        .setDescription("Create an auto responder")
        .addStringOption((opt) =>
          opt
            .setName("name")
            .setDescription("Choose a name")
            .setMinLength(2)
            .setMaxLength(100)
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("message")
            .setDescription("The new message of the tag")
            .setAutocomplete(true)
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("matcher_type")
            .setDescription("Choose a matcher type")
            .setRequired(true)
            .setChoices([
              {
                name: "Exact string",
                value: "exact",
              },
              {
                name: "Includes string",
                value: "includes",
              },
              {
                name: "Starts with string",
                value: "starts",
              },
              {
                name: "Ends with string",
                value: "ends",
              },
              {
                name: "Regex (Complex) matching",
                value: "regex",
              },
            ])
        )
        .addStringOption((opt) =>
          opt
            .setName("ignore_emojis_and_markdown")
            .setDescription("Select scope")
            .setChoices([
              { name: "Yes", value: "true" },
              { name: "No", value: "false" },
            ])
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("process_as_lowercase")
            .setDescription("Select scope")
            .setChoices([
              { name: "Yes", value: "true" },
              { name: "No", value: "false" },
            ])
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("matcher")
            .setDescription("The value for your matcher")
            .setMinLength(1)
            .setMaxLength(300)
            .setRequired(true)
        )
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("edit")
        .setDescription("Edit an auto responder")
        .addStringOption((opt) =>
          opt
            .setName("responder")
            .setDescription("Select an auto responder")
            .setAutocomplete(true)
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("name")
            .setDescription("Choose a name")
            .setMinLength(2)
            .setMaxLength(100)
            .setRequired(false)
        )
        .addStringOption((opt) =>
          opt
            .setName("message")
            .setDescription("The new message of the tag")
            .setAutocomplete(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("matcher_type")
            .setDescription("Choose a matcher type")
            .setRequired(false)
            .setChoices([
              {
                name: "Exact string",
                value: "exact",
              },
              {
                name: "Includes string",
                value: "includes",
              },
              {
                name: "Starts with string",
                value: "starts",
              },
              {
                name: "Ends with string",
                value: "ends",
              },
              {
                name: "Regex (Complex) matching",
                value: "regex",
              },
            ])
        )
        .addStringOption((opt) =>
          opt
            .setName("ignore_emojis_and_markdown")
            .setDescription("Select scope")
            .setChoices([
              { name: "Yes", value: "true" },
              { name: "No", value: "false" },
            ])
            .setRequired(false)
        )
        .addStringOption((opt) =>
          opt
            .setName("process_as_lowercase")
            .setDescription("Select scope")
            .setChoices([
              { name: "Yes", value: "true" },
              { name: "No", value: "false" },
            ])
            .setRequired(false)
        )
        .addStringOption((opt) =>
          opt
            .setName("matcher")
            .setDescription("The value for your matcher")
            .setMinLength(1)
            .setMaxLength(300)
            .setRequired(false)
        )
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("delete")
        .setDescription("Delete an auto responder")
        .addStringOption((opt) =>
          opt
            .setName("responder")
            .setDescription("Select an auto responder")
            .setAutocomplete(true)
            .setRequired(true)
        )
    ),
  async autocomplete(client, interaction) {
    if (!interaction.guildId) return;
    const focused = interaction.options.getFocused(true).name;
    if (focused === "responder") {
      const focusedValue = interaction.options.getString("responder", true);
      const responders = await getServerResponders(interaction.guildId);
      if (!responders.length) {
        interaction.respond([
          {
            name: "You don't have any responders!",
            value: "",
          },
        ]);
        return;
      }

      const filtered = responders.filter((m) =>
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
    const subcommand = interaction.options.getSubcommand(true);
    const lang = data.lang!;

    await interaction.reply({
      content: t(data.lang!, "THINK"),
      flags: [MessageFlags.Ephemeral],
    });

    const groups = await getServerGroups(interaction.guildId);
    const userPermissions = getUserPermissions(
      interaction.member as GuildMember,
      groups
    );

    if (subcommand === "allowed_channels") {
      if (
        !userPermissions.autoResponders.edit &&
        !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
      )
        return interaction.editReply(
          (await onError(new Error("Missing edit permission"))).discordMsg
        );

      const server = await getServer(interaction.guildId);

      interaction.editReply({
        content: t(lang, "SET_AUTO_RESPONDER_ALLOWED_CHANNELS"),
        components: [
          new ActionRowBuilder<ChannelSelectMenuBuilder>()
            .addComponents(
              new ChannelSelectMenuBuilder()
                .addChannelTypes(
                  ChannelType.PrivateThread,
                  ChannelType.AnnouncementThread,
                  ChannelType.GuildAnnouncement,
                  ChannelType.GuildText,
                  ChannelType.PublicThread
                )
                .setCustomId("autoResponderChannels")
                .setDefaultChannels(
                  server.settings.autoResponders?.extraAllowedChannels || []
                )
                .setPlaceholder("Select channels")
                .setMaxValues(limits.free.autoResponders.extraChannels)
            )
            .toJSON(),
        ],
      });
    } else if (subcommand === "new") {
      if (
        !userPermissions.autoResponders.create &&
        !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
      )
        return interaction.editReply(
          (await onError(new Error("Missing create permission"))).discordMsg
        );

      const responders = await getServerResponders(interaction.guildId);
      if (responders.length >= limits.free.autoResponders.amount)
        return interaction.editReply(
          (await onError(new Error("Auto responder limit reached"))).discordMsg
        );

      const id = generateId("AR");
      const name = interaction.options.getString("name", true);
      const messageId = interaction.options.getString("message", true);
      const scope = {
        clean:
          interaction.options.getString("ignore_emojis_and_markdown", true) ===
          "true",
        normalized:
          interaction.options.getString("process_as_lowercase", true) ===
          "true",
      };
      const matcherType = interaction.options.getString("matcher_type", true);
      const matcher = interaction.options.getString("matcher", true);
      const message = await getServerMessage(messageId, interaction.guildId);

      if (!message)
        return interaction.editReply(
          (await onError(new Error("Message not found"))).discordMsg
        );

      if (matcherType === "regex") {
        const validRegex = validateUserRegex(matcher);
        if (!validRegex.valid)
          return interaction.editReply(
            (await onError(new Error("Invalid regex"))).discordMsg
          );
      }

      const responder = await AutoResponderSchema.create({
        _id: id,
        name: name,
        server: interaction.guildId,
        message: messageId,
        matcher: matcher,
        matcherScope: scope,
        matcherType: matcherType,
      });

      interaction.editReply({
        content: t(lang, "RESPONDER_CREATED"),
      });
      await invalidateCache(`responders:${interaction.guildId}`);
      updateCachedData(
        `responder:${id}`,
        toTimeUnit("seconds", 0, 10),
        responder.toObject()
      );
      // This just loads the updated responders back into cache
      getServerResponders(interaction.guildId);
    } else if (subcommand === "view") {
      if (
        (!userPermissions.autoResponders.create ||
          !userPermissions.autoResponders.edit ||
          !userPermissions.autoResponders.delete) &&
        !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
      )
        return interaction.editReply(
          (await onError(new Error("Missing view permission"))).discordMsg
        );
      const responderId = interaction.options.getString("responder", true);
      const responder = await getServerResponder(
        responderId,
        interaction.guildId
      );
      if (!responder)
        return interaction.editReply(
          (await onError(new Error("Responder not found"))).discordMsg
        );

      interaction.editReply({
        embeds: [
          {
            color: parseInt(colours.info, 16),
            title: t(lang, "RESPONDER_INFO_TITLE"),
            fields: [
              {
                name: t(lang, "MATCHER_TYPE"),
                inline: true,
                value: t(
                  lang,
                  `MATCHER_TYPE_${responder.matcherType.toUpperCase()}`
                ),
              },
              {
                name: t(lang, "MATCHER_SCOPES"),
                inline: true,
                value: `${t(lang, `MATCHER_SCOPES_CLEAN`)}${t(
                  lang,
                  responder.matcherScope.clean ? "YES" : "NO"
                )}\n${t(lang, `MATCHER_SCOPES_NORMALIZE`)}${t(
                  lang,
                  responder.matcherScope.normalize ? "YES" : "NO"
                )}`,
              },
              {
                name: t(lang, "MATCHER"),
                value: `\`${responder.matcher}\``,
              },
              {
                name: t(lang, "MATCHER_MATCH_EXAMPLE"),
                value: `\`${generateExampleRegex(responder.matcher)}\``,
              },
            ],
          },
        ],
      });
    } else if (subcommand === "edit") {
      if (
        !userPermissions.autoResponders.edit &&
        !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
      )
        return interaction.editReply(
          (await onError(new Error("Missing edit permission"))).discordMsg
        );
      const responderId = interaction.options.getString("responder", true);
      const name = interaction.options.getString("name");
      const messageId = interaction.options.getString("message");
      const cleanScope = interaction.options.getString(
        "ignore_emojis_and_markdown"
      );
      const normalizedScope = interaction.options.getString(
        "process_as_lowercase"
      );
      const matcherType = interaction.options.getString("matcher_type");
      const matcher = interaction.options.getString("matcher");
      if (
        !name &&
        !messageId &&
        !matcherType &&
        !matcher &&
        !cleanScope &&
        !normalizedScope
      )
        return interaction.editReply(
          (await onError(new Error("Invalid usage"))).discordMsg
        );

      const responder = await getServerResponder(
        responderId,
        interaction.guildId
      );
      if (!responder)
        return interaction.editReply(
          (await onError(new Error("Responder not found"))).discordMsg
        );

      if (matcherType === "regex") {
        const validRegex = validateUserRegex(matcher || responder.matcher);
        if (!validRegex.valid)
          return interaction.editReply(
            (await onError(new Error("Invalid regex"))).discordMsg
          );
      }

      const message = await getServerMessage(
        messageId || responder.message,
        interaction.guildId
      );
      if (!message)
        return interaction.editReply(
          (await onError(new Error("Message not found"))).discordMsg
        );

      interaction.editReply({
        content: t(lang, "RESPONDER_UPDATED"),
      });
      await AutoResponderSchema.findOneAndUpdate(
        {
          _id: responderId,
        },
        {
          name: interaction.options.getString("name") || responder.name,
          message: message._id,
          matcherScope: {
            clean: cleanScope || responder.matcherScope.clean,
            normalize: normalizedScope || responder.matcherScope.normalize,
          },
          matcher: matcher || responder.matcher,
          matcherType: matcherType || responder.matcherType,
        }
      );

      await invalidateCache(`responders:${interaction.guildId}`);
      await invalidateCache(`responder:${responderId}`);
      InMemoryCache.invalidate(`responders:${interaction.guildId}`);
    } else if (subcommand === "delete") {
      if (
        !userPermissions.autoResponders.delete &&
        !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
      )
        return interaction.editReply(
          (await onError(new Error("Missing delete permission"))).discordMsg
        );
      const responderId = interaction.options.getString("responder", true);
      const responder = await getServerResponder(
        responderId,
        interaction.guildId
      );
      if (!responder)
        return interaction.editReply(
          (await onError(new Error("Responder not found"))).discordMsg
        );

      await AutoResponderSchema.findOneAndDelete({ _id: responderId });
      await invalidateCache(`responders:${interaction.guildId}`);
      await invalidateCache(`responder:${responderId}`);
      InMemoryCache.invalidate(`responders:${interaction.guildId}`);

      interaction.editReply({
        content: t(lang, "RESPONDER_DELETED"),
      });
    }
  },
};

export default cmd;
