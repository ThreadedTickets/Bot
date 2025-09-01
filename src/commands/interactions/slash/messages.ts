import {
  GuildMember,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import {
  getServerGroups,
  getServerMessage,
  getServerMessages,
} from "../../../utils/bot/getServer";
import { t } from "../../../lang";
import { getUserPermissions } from "../../../utils/calculateUserPermissions";
import { onError } from "../../../utils/onError";
import { Locale } from "../../../types/Locale";
import serverMessageToDiscordMessage from "../../../utils/formatters/serverMessageToDiscordMessage";
import { MessageCreatorSchema } from "../../../database/modals/MessageCreator";
import { updateCachedData } from "../../../utils/database/updateCache";
import colours from "../../../constants/colours";
import { invalidateCache } from "../../../utils/database/invalidateCache";
import { MessageSchema } from "../../../database/modals/Guild";

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

const cmd: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("messages")
    .setDescription("Messages configuration base")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild)
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

    if (subcommand === "view") {
      if (
        !userPermissions.messages.create &&
        !userPermissions.messages.edit &&
        !userPermissions.messages.delete &&
        !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
      )
        return interaction.editReply(
          (await onError(new Error("Missing view permission"))).discordMsg
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
          const error = (await onError(new Error("Invalid message")))
            .discordMsg;

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
          (await onError(new Error("Missing create permission"))).discordMsg
        );
      const name = interaction.options.getString("name", true).trim();
      if (!new RegExp(/^[0-9a-zA-Z-_ ]{2,100}$/, "g").test(name)) {
        const error = (await onError(new Error("Invalid name"))).discordMsg;

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
          (await onError(new Error("Missing edit permission"))).discordMsg
        );
      const id = interaction.options.getString("message", true);
      const message = await getServerMessage(id, interaction.guildId);
      if (!message) {
        const error = (await onError(new Error("Message not found")))
          .discordMsg;

        interaction.editReply(error);
        return;
      }

      const name = (interaction.options.getString("new_name") || message.name)
        .replace("[OLD]", "")
        .trim();

      if (!new RegExp(/^[0-9a-zA-Z-_ ]{2,100}$/, "g").test(name)) {
        const error = (await onError(new Error("Invalid name"))).discordMsg;

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
          (await onError(new Error("Missing delete permission"))).discordMsg
        );
      const id = interaction.options.getString("message", true);
      const message = await getServerMessage(id, interaction.guildId);
      if (!message) {
        const error = (await onError(new Error("Message not found")))
          .discordMsg;

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
  },
};

export default cmd;
