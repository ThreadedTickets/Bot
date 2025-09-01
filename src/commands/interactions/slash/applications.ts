import {
  GuildMember,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import {
  getServerApplication,
  getServerApplications,
  getServerGroups,
  getServerMessages,
  getServerTicketTriggers,
} from "../../../utils/bot/getServer";
import { getUserPermissions } from "../../../utils/calculateUserPermissions";
import { t } from "../../../lang";
import { onError } from "../../../utils/onError";
import { Locale } from "../../../types/Locale";
import { ApplicationCreatorSchema } from "../../../database/modals/ApplicationCreator";
import { updateCachedData } from "../../../utils/database/updateCache";
import { ApplicationTriggerSchema } from "../../../database/modals/Panel";
import { CompletedApplicationSchema } from "../../../database/modals/CompletedApplications";
import { invalidateCache } from "../../../utils/database/invalidateCache";

const cmd: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("applications")
    .setDescription("Application configuration base")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild)
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
    ),
  async autocomplete(client, interaction) {
    if (!interaction.guildId) return;
    const focused = interaction.options.getFocused(true).name;

    if (focused === "application") {
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
        !userPermissions.applications.manage &&
        !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
      )
        return interaction.editReply(
          (await onError(new Error("Missing manage permission"))).discordMsg
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
          (await onError(new Error("Missing manage permission"))).discordMsg
        );
      const id = interaction.options.getString("application", true);
      const application = await getServerApplication(id, interaction.guildId);
      if (!application) {
        const error = (await onError(new Error("Application not found")))
          .discordMsg;

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
          (await onError(new Error("Missing manage permission"))).discordMsg
        );
      const id = interaction.options.getString("application", true);
      const application = await getServerApplication(id, interaction.guildId);
      if (!application) {
        const error = (await onError(new Error("Application not found")))
          .discordMsg;

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
  },
};

export default cmd;
