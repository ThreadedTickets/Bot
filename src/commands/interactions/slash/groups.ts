import {
  GuildMember,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import { getServerGroup, getServerGroups } from "../../../utils/bot/getServer";
import { t } from "../../../lang";
import { getUserPermissions } from "../../../utils/calculateUserPermissions";
import { GroupCreatorSchema } from "../../../database/modals/GroupCreator";
import { onError } from "../../../utils/onError";
import { updateCachedData } from "../../../utils/database/updateCache";
import { invalidateCache } from "../../../utils/database/invalidateCache";
import { GroupSchema } from "../../../database/modals/Guild";

const cmd: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("groups")
    .setDescription("Groups configuration base")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild)
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
    ),
  async autocomplete(client, interaction) {
    if (!interaction.guildId) return;
    const focused = interaction.options.getFocused(true).name;
    if (focused === "group") {
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
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild))
        return interaction.editReply(
          (await onError(new Error("Missing permission"))).discordMsg
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
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild))
        return interaction.editReply(
          (await onError(new Error("Missing permission"))).discordMsg
        );
      const id = interaction.options.getString("group", true);
      const group = await getServerGroup(id, interaction.guildId);
      if (!group) {
        const error = (await onError(new Error("Group not found"))).discordMsg;

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
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild))
        return interaction.editReply(
          (await onError(new Error("Missing permission"))).discordMsg
        );
      const id = interaction.options.getString("group", true);
      const group = await getServerGroup(id, interaction.guildId);
      if (!group) {
        const error = (await onError(new Error("Group not found"))).discordMsg;

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
  },
};

export default cmd;
