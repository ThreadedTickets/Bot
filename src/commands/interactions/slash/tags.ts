import {
  GuildMember,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import {
  getServerGroups,
  getServerMessage,
  getServerTag,
  getServerTags,
} from "../../../utils/bot/getServer";
import { t } from "../../../lang";
import { getUserPermissions } from "../../../utils/calculateUserPermissions";
import { onError } from "../../../utils/onError";
import { Locale } from "../../../types/Locale";
import limits from "../../../constants/limits";
import { generateId } from "../../../utils/database/generateId";
import { TagSchema } from "../../../database/modals/Tag";
import { invalidateCache } from "../../../utils/database/invalidateCache";
import { updateCachedData } from "../../../utils/database/updateCache";
import { toTimeUnit } from "../../../utils/formatters/toTimeUnit";
import serverMessageToDiscordMessage from "../../../utils/formatters/serverMessageToDiscordMessage";

const cmd: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("tags")
    .setDescription("Tag configuration base")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((cmd) =>
      cmd
        .setName("view")
        .setDescription("View a tag")
        .addStringOption((opt) =>
          opt
            .setName("tag")
            .setDescription("Select a tag")
            .setAutocomplete(true)
            .setRequired(true)
        )
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("new")
        .setDescription("Create a new tag")
        .addStringOption((opt) =>
          opt
            .setName("name")
            .setDescription("The name of this tag")
            .setRequired(true)
            .setMaxLength(100)
            .setMinLength(2)
        )
        .addStringOption((opt) =>
          opt
            .setName("message")
            .setDescription("The new message of the tag")
            .setAutocomplete(true)
            .setRequired(true)
        )
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("delete")
        .setDescription("Delete a tag")
        .addStringOption((opt) =>
          opt
            .setName("tag")
            .setDescription("The name of the tag to edit")
            .setAutocomplete(true)
            .setRequired(true)
        )
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("edit")
        .setDescription("Create a new tag")
        .addStringOption((opt) =>
          opt
            .setName("tag")
            .setDescription("The name of the tag to edit")
            .setAutocomplete(true)
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("name")
            .setDescription("The new name of the tag")
            .setMaxLength(100)
            .setMinLength(2)
        )
        .addStringOption((opt) =>
          opt
            .setName("message")
            .setDescription("The new message of the tag")
            .setAutocomplete(true)
        )
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

    if (subcommand === "new") {
      if (
        !userPermissions.tags.create &&
        !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
      )
        return interaction.editReply(
          (
            await onError(
              "Commands",
              t(lang, "MISSING_PERMISSIONS"),
              {},
              lang as Locale
            )
          ).discordMsg
        );

      const tags = await getServerTags(interaction.guildId);
      if (tags.length >= limits.free.tags.amount)
        return interaction.editReply(
          (
            await onError(
              "Commands",
              t(lang, "TAGS_LIMIT_REACHED"),
              {},
              lang as Locale
            )
          ).discordMsg
        );

      const id = generateId("GT");
      const name = interaction.options.getString("name", true);
      const messageId = interaction.options.getString("message", true);
      const message = await getServerMessage(messageId, interaction.guildId);

      if (!message)
        return interaction.editReply(
          (
            await onError(
              "Commands",
              t(lang, "CONFIG_CREATE_MESSAGE_NOT_FOUND"),
              {},
              lang as Locale
            )
          ).discordMsg
        );

      const tag = await TagSchema.create({
        _id: id,
        name: name,
        server: interaction.guildId,
        message: messageId,
      });

      interaction.editReply({
        content: t(lang, "TAG_CREATED"),
      });
      await invalidateCache(`tags:${interaction.guildId}`);
      updateCachedData(
        `tag:${id}`,
        toTimeUnit("seconds", 0, 10),
        tag.toObject()
      );
    } else if (subcommand === "view") {
      if (
        (!userPermissions.tags.create ||
          !userPermissions.tags.edit ||
          !userPermissions.tags.delete) &&
        !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
      )
        return interaction.editReply(
          (
            await onError(
              "Commands",
              t(lang, "MISSING_PERMISSIONS"),
              {},
              lang as Locale
            )
          ).discordMsg
        );
      const tagId = interaction.options.getString("tag", true);
      const tag = await getServerTag(tagId, interaction.guildId);
      if (!tag)
        return interaction.editReply(
          (
            await onError(
              "Commands",
              t(lang, "TAG_NOT_FOUND"),
              {},
              lang as Locale
            )
          ).discordMsg
        );

      const message = await getServerMessage(tag.message, interaction.guildId);
      if (!message)
        return interaction.editReply(
          (
            await onError(
              "Commands",
              t(lang, "TAG_MESSAGE_NOT_FOUND"),
              {},
              lang as Locale
            )
          ).discordMsg
        );

      interaction.editReply({
        ...serverMessageToDiscordMessage(message),
      });
    } else if (subcommand === "edit") {
      if (
        !userPermissions.tags.edit &&
        !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
      )
        return interaction.editReply(
          (
            await onError(
              "Commands",
              t(lang, "MISSING_PERMISSIONS"),
              {},
              lang as Locale
            )
          ).discordMsg
        );
      const tagId = interaction.options.getString("tag", true);
      const name = interaction.options.getString("name");
      const messageId = interaction.options.getString("message");
      if (!name && !messageId)
        return interaction.editReply(
          (
            await onError(
              "Commands",
              t(lang, "TAG_UPDATE_NO_OPTIONS"),
              {},
              lang as Locale
            )
          ).discordMsg
        );

      const tag = await getServerTag(tagId, interaction.guildId);
      if (!tag)
        return interaction.editReply(
          (
            await onError(
              "Commands",
              t(lang, "TAG_NOT_FOUND"),
              {},
              lang as Locale
            )
          ).discordMsg
        );

      const message = await getServerMessage(
        messageId || tag.message,
        interaction.guildId
      );
      if (!message)
        return interaction.editReply(
          (
            await onError(
              "Commands",
              t(lang, "CONFIG_CREATE_MESSAGE_NOT_FOUND"),
              {},
              lang as Locale
            )
          ).discordMsg
        );

      interaction.editReply({
        content: t(lang, "TAG_UPDATED"),
      });
      await TagSchema.findOneAndUpdate(
        {
          _id: tagId,
        },
        {
          name: interaction.options.getString("name") || tag.name,
          message: message._id,
        }
      );

      await invalidateCache(`tags:${interaction.guildId}`);
      // We don't need to worry about invalidating the individual tag cache as this is only used for the message
    } else if (subcommand === "delete") {
      if (
        !userPermissions.tags.delete &&
        !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
      )
        return interaction.editReply(
          (
            await onError(
              "Commands",
              t(lang, "MISSING_PERMISSIONS"),
              {},
              lang as Locale
            )
          ).discordMsg
        );
      const tagId = interaction.options.getString("tag", true);
      const tag = await getServerTag(tagId, interaction.guildId);
      if (!tag)
        return interaction.editReply(
          (
            await onError(
              "Commands",
              t(lang, "TAG_NOT_FOUND"),
              {},
              lang as Locale
            )
          ).discordMsg
        );

      await TagSchema.findOneAndDelete({ _id: tagId });
      await invalidateCache(`tags:${interaction.guildId}`);
      await invalidateCache(`tag:${tagId}`);

      interaction.editReply({
        content: t(lang, "TAG_DELETED"),
      });
    }
  },
};

export default cmd;
