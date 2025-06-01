import {
  ActionRowBuilder,
  APIEmbed,
  ChannelSelectMenuBuilder,
  ChannelType,
  GuildMember,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import { onError } from "../../../utils/onError";
import {
  getServer,
  getServerApplication,
  getServerApplications,
  getServerGroup,
  getServerGroups,
  getServerMessage,
  getServerMessages,
  getServerResponder,
  getServerResponders,
  getServerTag,
  getServerTags,
  getServerTicketTrigger,
  getServerTicketTriggers,
} from "../../../utils/bot/getServer";
import { t } from "../../../lang";
import { Locale } from "../../../types/Locale";
import { MessageCreatorSchema } from "../../../database/modals/MessageCreator";
import { updateCachedData } from "../../../utils/database/updateCache";
import serverMessageToDiscordMessage from "../../../utils/formatters/serverMessageToDiscordMessage";
import { getUserPermissions } from "../../../utils/calculateUserPermissions";
import { GroupCreatorSchema } from "../../../database/modals/GroupCreator";
import { invalidateCache } from "../../../utils/database/invalidateCache";
import { GroupSchema, MessageSchema } from "../../../database/modals/Guild";
import limits from "../../../constants/limits";
import { TagSchema } from "../../../database/modals/Tag";
import { generateId } from "../../../utils/database/generateId";
import { toTimeUnit } from "../../../utils/formatters/toTimeUnit";
import { AutoResponderSchema } from "../../../database/modals/AutoResponder";
import {
  generateExampleRegex,
  validateUserRegex,
} from "../../../utils/formatters/validateRegex";
import { InMemoryCache } from "../../..";
import colours from "../../../constants/colours";
import { ApplicationCreatorSchema } from "../../../database/modals/ApplicationCreator";
import {
  ApplicationTriggerSchema,
  TicketTriggerSchema,
} from "../../../database/modals/Panel";
import { CompletedApplicationSchema } from "../../../database/modals/CompletedApplications";
import { TicketTriggerCreatorSchema } from "../../../database/modals/TicketTriggerCreator";

function normalizeMessage(raw: any): {
  content: string;
  embeds?: {
    title?: string;
    description?: string;
    color?: string;
    fields?: { name: string; value: string; inline?: boolean }[];
    author?: { name?: string; url?: string; icon_url?: string };
    footer?: { text?: string; icon_url?: string };
    thumbnail?: { url: string };
    image?: { url: string };
    timestamp?: boolean | Date;
  }[];
  components: any[];
} {
  return {
    content: raw.content ?? "",
    components: raw.components ?? [],
    embeds: (raw.embeds ?? []).map((embed: any) => ({
      title: embed.title ?? null,
      description: embed.description ?? null,
      color:
        embed.color !== undefined
          ? `#${embed.color.toString(16).padStart(6, "0")}`
          : `#${colours.primary}`,
      fields: Array.isArray(embed.fields) ? embed.fields : [],
      author: {
        name: embed.author?.name ?? null,
        url: embed.author?.url ?? null,
        icon_url: embed.author?.icon_url ?? null,
      },
      footer: {
        text: embed.footer?.text ?? null,
        icon_url: embed.footer?.icon_url ?? null,
      },
      thumbnail: { url: embed.thumbnail?.url ?? null },
      image: { url: embed.image?.url ?? null },
      timestamp:
        typeof embed.timestamp === "boolean" || embed.timestamp instanceof Date
          ? embed.timestamp
          : null,
    })),
  };
}

const command: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("configure")
    .setDescription("Threaded's configuration base command")
    .setContexts(InteractionContextType.Guild)
    .addSubcommandGroup((cmd) =>
      cmd
        .setName("autoresponders")
        .setDescription("Auto Responder configuration base")
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
        )
    )
    .addSubcommandGroup((cmd) =>
      cmd
        .setName("tags")
        .setDescription("Tag configuration base")
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
        )
    )
    .addSubcommandGroup((cmd) =>
      cmd
        .setName("messages")
        .setDescription("Messages configuration base")
        .addSubcommand((cmd) =>
          cmd
            .setName("view")
            .setDescription("View a message")
            .addStringOption((opt) =>
              opt
                .setName("message")
                .setDescription("Select the message to view")
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("new")
            .setDescription("Create a new message")
            .addStringOption((opt) =>
              opt
                .setName("name")
                .setDescription("The name of your new message")
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(100)
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("edit")
            .setDescription("Edit an existing message")
            .addStringOption((opt) =>
              opt
                .setName("message")
                .setDescription("Which message do you want to edit?")
                .setRequired(true)
                .setAutocomplete(true)
            )
            .addStringOption((opt) =>
              opt
                .setName("new_name")
                .setDescription("The new name of your message")
                .setRequired(false)
                .setMinLength(2)
                .setMaxLength(100)
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("delete")
            .setDescription("Delete an existing message")
            .addStringOption((opt) =>
              opt
                .setName("message")
                .setDescription("Which message do you want to delete?")
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
    )
    .addSubcommandGroup((cmd) =>
      cmd
        .setName("groups")
        .setDescription("Groups configuration base")
        .addSubcommand((cmd) =>
          cmd.setName("new").setDescription("Create a new group")
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("edit")
            .setDescription("Edit an existing group")
            .addStringOption((opt) =>
              opt
                .setName("group")
                .setDescription("Which group do you want to edit?")
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("delete")
            .setDescription("Delete an existing group")
            .addStringOption((opt) =>
              opt
                .setName("group")
                .setDescription("Which group do you want to delete?")
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
    )
    .addSubcommandGroup((cmd) =>
      cmd
        .setName("applications")
        .setDescription("Application configuration base")
        .addSubcommand((cmd) =>
          cmd.setName("new").setDescription("Create a new application")
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("edit")
            .setDescription("Edit an existing application")
            .addStringOption((opt) =>
              opt
                .setName("application")
                .setDescription("Which application do you want to edit?")
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("delete")
            .setDescription("Delete an existing application")
            .addStringOption((opt) =>
              opt
                .setName("application")
                .setDescription("Which application do you want to delete?")
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
    )
    .addSubcommandGroup((cmd) =>
      cmd
        .setName("ticket_triggers")
        .setDescription("Ticket trigger configuration base")
        .addSubcommand((cmd) =>
          cmd.setName("new").setDescription("Create a new ticket trigger")
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("edit")
            .setDescription("Edit an existing ticket trigger")
            .addStringOption((opt) =>
              opt
                .setName("ticket_trigger")
                .setDescription("Which ticket trigger do you want to edit?")
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("delete")
            .setDescription("Delete an existing ticket trigger")
            .addStringOption((opt) =>
              opt
                .setName("ticket_trigger")
                .setDescription("Which ticket trigger do you want to delete?")
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
    ),

  async autocomplete(client, interaction) {
    if (!interaction.guildId) return;
    const focused = interaction.options.getFocused(true).name;

    if (focused === "message") {
      const messages = await getServerMessages(interaction.guildId);
      const focusedValue = interaction.options.getString("message", true);
      if (!messages.length) {
        interaction.respond([
          {
            name: "You don't have any messages!",
            value: "",
          },
        ]);
        return;
      }

      const filtered = messages.filter((m) =>
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
    } else if (focused === "group") {
      const focusedValue = interaction.options.getString("group", true);
      const groups = await getServerGroups(interaction.guildId);
      if (!groups.length) {
        interaction.respond([
          {
            name: "You don't have any groups!",
            value: "",
          },
        ]);
        return;
      }

      const filtered = groups.filter((m) =>
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
    } else if (focused === "tag") {
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
    } else if (focused === "responder") {
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
    } else if (focused === "application") {
      const focusedValue = interaction.options.getString("application", true);
      const applications = await getServerApplications(interaction.guildId);
      if (!applications.length) {
        interaction.respond([
          {
            name: "You don't have any applications!",
            value: "",
          },
        ]);
        return;
      }

      const filtered = applications.filter((m) =>
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
    } else if (focused === "ticket_trigger") {
      const focusedValue = interaction.options.getString(
        "ticket_trigger",
        true
      );
      const triggers = await getServerTicketTriggers(interaction.guildId);
      if (!triggers.length) {
        interaction.respond([
          {
            name: "You don't have any ticket triggers!",
            value: "",
          },
        ]);
        return;
      }

      const filtered = triggers.filter((m) =>
        m.label.toLowerCase().includes(focusedValue.toLowerCase())
      );

      interaction.respond(
        filtered
          .map((m) => ({
            name: m.label,
            value: m._id,
          }))
          .slice(0, 25)
      );
    }
  },

  async execute(client, data, interaction) {
    if (!interaction.guildId) return;
    const subcommandGroup = interaction.options.getSubcommandGroup(true);
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

    if (subcommandGroup === "messages") {
      if (subcommand === "view") {
        if (
          !userPermissions.messages.create &&
          !userPermissions.messages.edit &&
          !userPermissions.messages.delete &&
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
        const message = interaction.options.getString("message", true);
        const svrMsg = await getServerMessage(message, interaction.guildId);
        if (!message || !svrMsg)
          return interaction.editReply({
            content: t(lang, "CONFIG_CREATE_MESSAGE_NOT_FOUND"),
          });

        interaction
          .editReply(serverMessageToDiscordMessage(svrMsg))
          .catch(async (err) => {
            const error = (
              await onError(
                "Commands",
                t(lang, "MESSAGE_CANNOT_SEND_AS_INVALID"),
                { message: err.message, stack: err.stack },
                lang as Locale
              )
            ).discordMsg;

            if (!interaction.replied) {
              interaction.editReply(error);
            } else {
              interaction.followUp(error);
            }
          });
      } else if (subcommand === "new") {
        if (
          !userPermissions.messages.create &&
          !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
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
        const name = interaction.options.getString("name", true).trim();
        if (!new RegExp(/^[0-9a-zA-Z-_ ]{2,100}$/, "g").test(name)) {
          const error = (
            await onError(
              "Commands",
              t(lang, "MESSAGE_NAME_NOT_VALID"),
              {},
              lang as Locale
            )
          ).discordMsg;

          interaction.editReply(error);
        }

        const document = await MessageCreatorSchema.create({
          guildId: interaction.guildId,
          name: name,
          metadata: {
            roles: interaction.guild?.roles.cache
              .filter((r) => r.id != interaction.guildId)
              .sort((a, b) => b.position - a.position)
              .map((role) => ({
                id: role.id,
                name: role.name,
                colour: role.hexColor,
              })),
            channels: interaction.guild?.channels.cache.map((channel) => ({
              id: channel.id,
              name: channel.name,
              type: channel.type,
            })),
          },
        });

        updateCachedData(
          `messageCreators:${document._id}`,
          parseInt(process.env["TTL_MESSAGE_CREATORS"]!),
          document.toObject()
        );

        interaction.editReply({
          content: t(lang, "MESSAGE_CREATE_GOTO_LINK", {
            link: `${process.env["URL_MESSAGE_CREATOR"]}?id=${document._id}`,
          }),
        });
      } else if (subcommand === "edit") {
        if (
          !userPermissions.messages.edit &&
          !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
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
        const id = interaction.options.getString("message", true);
        const message = await getServerMessage(id, interaction.guildId);
        if (!message) {
          const error = (
            await onError(
              "Commands",
              t(lang, "CONFIG_CREATE_MESSAGE_NOT_FOUND"),
              {},
              lang as Locale
            )
          ).discordMsg;

          interaction.editReply(error);
          return;
        }

        const name = (interaction.options.getString("new_name") || message.name)
          .replace("[OLD]", "")
          .trim();

        if (!new RegExp(/^[0-9a-zA-Z-_ ]{2,100}$/, "g").test(name)) {
          const error = (
            await onError(
              "Commands",
              t(lang, "MESSAGE_NAME_NOT_VALID"),
              {},
              lang as Locale
            )
          ).discordMsg;

          interaction.editReply(error);
        }

        const document = await MessageCreatorSchema.create({
          guildId: interaction.guildId,
          name: name,
          existingMessage: normalizeMessage(message),
          metadata: {
            link: id,
            roles: interaction.guild?.roles.cache
              .filter((r) => r.id != interaction.guildId)
              .sort((a, b) => b.position - a.position)
              .map((role) => ({
                id: role.id,
                name: role.name,
                colour: role.hexColor,
              })),
            channels: interaction.guild?.channels.cache.map((channel) => ({
              id: channel.id,
              name: channel.name,
              type: channel.type,
            })),
          },
        });

        updateCachedData(
          `messageCreators:${document._id}`,
          parseInt(process.env["TTL_MESSAGE_CREATORS"]!),
          document.toObject()
        );

        interaction.editReply({
          content: t(lang, "MESSAGE_CREATE_GOTO_LINK", {
            link: `${process.env["URL_MESSAGE_CREATOR"]}?id=${document._id}`,
          }),
        });
      } else if (subcommand === "delete") {
        if (
          !userPermissions.messages.delete &&
          !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
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
        const id = interaction.options.getString("message", true);
        const message = await getServerMessage(id, interaction.guildId);
        if (!message) {
          const error = (
            await onError(
              "Commands",
              t(lang, "CONFIG_CREATE_MESSAGE_NOT_FOUND"),
              {},
              lang as Locale
            )
          ).discordMsg;

          interaction.editReply(error);
          return;
        }

        await MessageSchema.findOneAndDelete({ _id: id });
        await invalidateCache(`messages:${interaction.guildId}`);
        await invalidateCache(`message:${id}`);

        interaction.editReply({
          content: t(lang, "MESSAGE_DELETED"),
        });
      }
    } else if (subcommandGroup === "groups") {
      if (subcommand === "new") {
        if (
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

        const document = await GroupCreatorSchema.create({
          guildId: interaction.guildId,
          metadata: {
            roles: interaction.guild?.roles.cache
              .filter((r) => r.id != interaction.guildId)
              .sort((a, b) => b.position - a.position)
              .map((role) => ({
                id: role.id,
                name: role.name,
                colour: role.hexColor,
              })),
          },
        });

        updateCachedData(
          `groupCreators:${document._id}`,
          parseInt(process.env["TTL_GROUP_CREATORS"]!),
          document.toObject()
        );

        interaction.editReply({
          content: t(lang, "GROUP_CREATE_GOTO_LINK", {
            link: `${process.env["URL_GROUP_CREATOR"]}?id=${document._id}`,
          }),
        });
      } else if (subcommand === "edit") {
        if (
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
        const id = interaction.options.getString("group", true);
        const group = await getServerGroup(id, interaction.guildId);
        if (!group) {
          const error = (
            await onError(
              "Commands",
              t(lang, "CONFIG_CREATE_GROUP_NOT_FOUND"),
              {},
              lang as Locale
            )
          ).discordMsg;

          interaction.editReply(error);
          return;
        }

        const document = await GroupCreatorSchema.create({
          guildId: interaction.guildId,
          existingGroup: group,
          metadata: {
            link: id,
            roles: interaction.guild?.roles.cache
              .filter((r) => r.id != interaction.guildId)
              .sort((a, b) => b.position - a.position)
              .map((role) => ({
                id: role.id,
                name: role.name,
                colour: role.hexColor,
              })),
          },
        });

        updateCachedData(
          `groupCreators:${document._id}`,
          parseInt(process.env["TTL_GROUP_CREATORS"]!),
          document.toObject()
        );

        interaction.editReply({
          content: t(lang, "GROUP_CREATE_GOTO_LINK", {
            link: `${process.env["URL_GROUP_CREATOR"]}?id=${document._id}`,
          }),
        });
      } else if (subcommand === "delete") {
        if (
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
        const id = interaction.options.getString("group", true);
        const group = await getServerGroup(id, interaction.guildId);
        if (!group) {
          const error = (
            await onError(
              "Commands",
              t(lang, "CONFIG_CREATE_GROUP_NOT_FOUND"),
              {},
              lang as Locale
            )
          ).discordMsg;

          interaction.editReply(error);
          return;
        }

        await GroupSchema.findOneAndDelete({ _id: id });
        await invalidateCache(`groups:${interaction.guildId}`);
        await invalidateCache(`group:${id}`);

        interaction.editReply({
          content: t(lang, "GROUP_DELETED"),
        });
      }
    } else if (subcommandGroup === "tags") {
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

        const message = await getServerMessage(
          tag.message,
          interaction.guildId
        );
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
    } else if (subcommandGroup === "autoresponders") {
      if (subcommand === "allowed_channels") {
        if (
          !userPermissions.autoResponders.edit &&
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
            (
              await onError(
                "Commands",
                t(lang, "MISSING_PERMISSIONS"),
                {},
                lang as Locale
              )
            ).discordMsg
          );

        const responders = await getServerResponders(interaction.guildId);
        if (responders.length >= limits.free.autoResponders.amount)
          return interaction.editReply(
            (
              await onError(
                "Commands",
                t(lang, "RESPONDERS_LIMIT_REACHED"),
                {},
                lang as Locale
              )
            ).discordMsg
          );

        const id = generateId("AR");
        const name = interaction.options.getString("name", true);
        const messageId = interaction.options.getString("message", true);
        const scope = {
          clean:
            interaction.options.getString(
              "ignore_emojis_and_markdown",
              true
            ) === "true",
          normalized:
            interaction.options.getString("process_as_lowercase", true) ===
            "true",
        };
        const matcherType = interaction.options.getString("matcher_type", true);
        const matcher = interaction.options.getString("matcher", true);
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

        if (matcherType === "regex") {
          const validRegex = validateUserRegex(matcher);
          if (!validRegex.valid)
            return interaction.editReply(
              (
                await onError(
                  "Commands",
                  t(lang, "INVALID_MATCHER_REGEX"),
                  {
                    matcher,
                  },
                  lang as Locale
                )
              ).discordMsg
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
            (
              await onError(
                "Commands",
                t(lang, "MISSING_PERMISSIONS"),
                {},
                lang as Locale
              )
            ).discordMsg
          );
        const responderId = interaction.options.getString("responder", true);
        const responder = await getServerResponder(
          responderId,
          interaction.guildId
        );
        if (!responder)
          return interaction.editReply(
            (
              await onError(
                "Commands",
                t(lang, "RESPONDER_NOT_FOUND"),
                {},
                lang as Locale
              )
            ).discordMsg
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
            (
              await onError(
                "Commands",
                t(lang, "MISSING_PERMISSIONS"),
                {},
                lang as Locale
              )
            ).discordMsg
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
            (
              await onError(
                "Commands",
                t(lang, "RESPONDER_UPDATE_NO_OPTIONS"),
                {},
                lang as Locale
              )
            ).discordMsg
          );

        const responder = await getServerResponder(
          responderId,
          interaction.guildId
        );
        if (!responder)
          return interaction.editReply(
            (
              await onError(
                "Commands",
                t(lang, "RESPONDER_NOT_FOUND"),
                {},
                lang as Locale
              )
            ).discordMsg
          );

        if (matcherType === "regex") {
          const validRegex = validateUserRegex(matcher || responder.matcher);
          if (!validRegex.valid)
            return interaction.editReply(
              (
                await onError(
                  "Commands",
                  t(lang, "INVALID_MATCHER_REGEX"),
                  {
                    matcher,
                  },
                  lang as Locale
                )
              ).discordMsg
            );
        }

        const message = await getServerMessage(
          messageId || responder.message,
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
            (
              await onError(
                "Commands",
                t(lang, "MISSING_PERMISSIONS"),
                {},
                lang as Locale
              )
            ).discordMsg
          );
        const responderId = interaction.options.getString("responder", true);
        const responder = await getServerResponder(
          responderId,
          interaction.guildId
        );
        if (!responder)
          return interaction.editReply(
            (
              await onError(
                "Commands",
                t(lang, "RESPONDER_NOT_FOUND"),
                {},
                lang as Locale
              )
            ).discordMsg
          );

        await AutoResponderSchema.findOneAndDelete({ _id: responderId });
        await invalidateCache(`responders:${interaction.guildId}`);
        await invalidateCache(`responder:${responderId}`);
        InMemoryCache.invalidate(`responders:${interaction.guildId}`);

        interaction.editReply({
          content: t(lang, "RESPONDER_DELETED"),
        });
      }
    } else if (subcommandGroup === "applications") {
      if (subcommand === "new") {
        if (
          !userPermissions.applications.manage &&
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

        const document = await ApplicationCreatorSchema.create({
          guildId: interaction.guildId,
          metadata: {
            roles: interaction.guild?.roles.cache
              .filter((r) => r.id != interaction.guildId)
              .sort((a, b) => b.position - a.position)
              .map((role) => ({
                value: role.id,
                label: role.name,
              })),
            channels: interaction.guild?.channels.cache
              .filter((r) => r.id != interaction.guildId && r.isTextBased())
              .map((role) => ({
                value: role.id,
                label: role.name,
              })),
            messages: (
              await getServerMessages(interaction.guildId)
            ).map((role: any) => ({
              value: role._id,
              label: role.name,
            })),
            groups: (
              await getServerGroups(interaction.guildId)
            ).map((role: any) => ({
              value: role._id,
              label: role.name,
            })),
            ticketTriggers: (
              await getServerTicketTriggers(interaction.guildId)
            ).map((role) => ({
              value: role._id,
              label: role.label,
            })),
          },
        });

        updateCachedData(
          `applicationCreators:${document._id}`,
          parseInt(process.env["TTL_APPLICATION_CREATORS"]!),
          document.toObject()
        );

        interaction.editReply({
          content: t(lang, "APPLICATION_CREATE_GOTO_LINK", {
            link: `${process.env["URL_APPLICATION_CREATOR"]}?id=${document._id}`,
          }),
        });
      } else if (subcommand === "edit") {
        if (
          !userPermissions.applications.manage &&
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
        const id = interaction.options.getString("application", true);
        const application = await getServerApplication(id, interaction.guildId);
        if (!application) {
          const error = (
            await onError(
              "Commands",
              t(lang, "CONFIG_CREATE_APPLICATION_NOT_FOUND"),
              {},
              lang as Locale
            )
          ).discordMsg;

          interaction.editReply(error);
          return;
        }

        const document = await ApplicationCreatorSchema.create({
          guildId: interaction.guildId,
          existingApplication: application,
          metadata: {
            link: id,
            roles: interaction.guild?.roles.cache
              .filter((r) => r.id != interaction.guildId)
              .sort((a, b) => b.position - a.position)
              .map((role) => ({
                value: role.id,
                label: role.name,
              })),
            channels: interaction.guild?.channels.cache
              .filter((r) => r.id != interaction.guildId && r.isTextBased())
              .map((role) => ({
                value: role.id,
                label: role.name,
              })),
            messages: (
              await getServerMessages(interaction.guildId)
            ).map((role: any) => ({
              value: role._id,
              label: role.name,
            })),
            groups: (
              await getServerGroups(interaction.guildId)
            ).map((role: any) => ({
              value: role._id,
              label: role.name,
            })),
            ticketTriggers: (
              await getServerTicketTriggers(interaction.guildId)
            ).map((role) => ({
              value: role._id,
              label: role.label,
            })),
          },
        });

        updateCachedData(
          `applicationCreators:${document._id}`,
          parseInt(process.env["TTL_APPLICATION_CREATORS"]!),
          document.toObject()
        );

        interaction.editReply({
          content: t(lang, "APPLICATION_CREATE_GOTO_LINK", {
            link: `${process.env["URL_APPLICATION_CREATOR"]}?id=${document._id}`,
          }),
        });
      } else if (subcommand === "delete") {
        if (
          !userPermissions.applications.manage &&
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
        const id = interaction.options.getString("application", true);
        const application = await getServerApplication(id, interaction.guildId);
        if (!application) {
          const error = (
            await onError(
              "Commands",
              t(lang, "CONFIG_CREATE_APPLICATION_NOT_FOUND"),
              {},
              lang as Locale
            )
          ).discordMsg;

          interaction.editReply(error);
          return;
        }

        // creators will just let themselves expire
        await ApplicationTriggerSchema.findOneAndDelete({ _id: id });
        await CompletedApplicationSchema.deleteMany({
          application: id,
        });
        await invalidateCache(`applications:${interaction.guildId}`);
        await invalidateCache(`application:${id}`);

        interaction.editReply({
          content: t(lang, "APPLICATION_DELETED"),
        });
      }
    } else if (subcommandGroup === "ticket_triggers") {
      if (subcommand === "new") {
        if (
          !userPermissions.panels.manage &&
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

        const document = await TicketTriggerCreatorSchema.create({
          guildId: interaction.guildId,
          metadata: {
            roles: interaction.guild?.roles.cache
              .filter((r) => r.id != interaction.guildId)
              .sort((a, b) => b.position - a.position)
              .map((role) => ({
                value: role.id,
                label: role.name,
              })),
            textChannels: interaction.guild?.channels.cache
              .filter((r) => r.id != interaction.guildId && r.isTextBased())
              .map((role) => ({
                value: role.id,
                label: role.name,
              })),
            categories: interaction.guild?.channels.cache
              .filter(
                (r) =>
                  r.id != interaction.guildId &&
                  r.type === ChannelType.GuildCategory
              )
              .map((role) => ({
                value: role.id,
                label: role.name,
              })),
            messages: (
              await getServerMessages(interaction.guildId)
            ).map((role: any) => ({
              value: role._id,
              label: role.name,
            })),
            groups: (
              await getServerGroups(interaction.guildId)
            ).map((role: any) => ({
              value: role._id,
              label: role.name,
            })),
          },
        });

        updateCachedData(
          `ticketTriggerCreators:${document._id}`,
          parseInt(process.env["TTL_TICKET_TRIGGER_CREATORS"]!),
          document.toObject()
        );

        interaction.editReply({
          content: t(lang, "TICKET_TRIGGER_CREATE_GOTO_LINK", {
            link: `${process.env["URL_TICKET_TRIGGER_CREATOR"]}?id=${document._id}`,
          }),
        });
      } else if (subcommand === "edit") {
        if (
          !userPermissions.panels.manage &&
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
        const id = interaction.options.getString("ticket_trigger", true);
        const trigger = await getServerTicketTrigger(id, interaction.guildId);
        if (!trigger) {
          const error = (
            await onError(
              "Commands",
              t(lang, "CONFIG_CREATE_TICKET_TRIGGER_NOT_FOUND"),
              {},
              lang as Locale
            )
          ).discordMsg;

          interaction.editReply(error);
          return;
        }

        const document = await TicketTriggerCreatorSchema.create({
          guildId: interaction.guildId,
          existingTrigger: trigger,
          metadata: {
            link: id,
            roles: interaction.guild?.roles.cache
              .filter((r) => r.id != interaction.guildId)
              .sort((a, b) => b.position - a.position)
              .map((role) => ({
                value: role.id,
                label: role.name,
              })),
            textChannels: interaction.guild?.channels.cache
              .filter((r) => r.id != interaction.guildId && r.isTextBased())
              .map((role) => ({
                value: role.id,
                label: role.name,
              })),
            categories: interaction.guild?.channels.cache
              .filter(
                (r) =>
                  r.id != interaction.guildId &&
                  r.type === ChannelType.GuildCategory
              )
              .map((role) => ({
                value: role.id,
                label: role.name,
              })),
            messages: (
              await getServerMessages(interaction.guildId)
            ).map((role: any) => ({
              value: role._id,
              label: role.name,
            })),
            groups: (
              await getServerGroups(interaction.guildId)
            ).map((role: any) => ({
              value: role._id,
              label: role.name,
            })),
          },
        });

        updateCachedData(
          `ticketTriggerCreators:${document._id}`,
          parseInt(process.env["TTL_TICKET_TRIGGER_CREATORS"]!),
          document.toObject()
        );

        interaction.editReply({
          content: t(lang, "TICKET_TRIGGER_CREATE_GOTO_LINK", {
            link: `${process.env["URL_TICKET_TRIGGER_CREATOR"]}?id=${document._id}`,
          }),
        });
      } else if (subcommand === "delete") {
        if (
          !userPermissions.panels.manage &&
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
        const id = interaction.options.getString("ticket_trigger", true);
        const trigger = await getServerTicketTrigger(id, interaction.guildId);
        if (!trigger) {
          const error = (
            await onError(
              "Commands",
              t(lang, "CONFIG_CREATE_TICKET_TRIGGER_NOT_FOUND"),
              {},
              lang as Locale
            )
          ).discordMsg;

          interaction.editReply(error);
          return;
        }

        await TicketTriggerSchema.findOneAndDelete({ _id: id });
        await invalidateCache(`ticketTriggers:${interaction.guildId}`);
        await invalidateCache(`ticketTrigger:${id}`);

        interaction.editReply({
          content: t(lang, "TICKET_TRIGGER_DELETED"),
        });
      }
    }
  },
};

export default command;
