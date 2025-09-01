import {
  ChannelType,
  GuildMember,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import {
  getServerGroups,
  getServerMessages,
  getServerTicketTrigger,
  getServerTicketTriggers,
} from "../../../utils/bot/getServer";
import { t } from "../../../lang";
import { getUserPermissions } from "../../../utils/calculateUserPermissions";
import { onError } from "../../../utils/onError";
import { Locale } from "../../../types/Locale";
import { TicketTriggerCreatorSchema } from "../../../database/modals/TicketTriggerCreator";
import { updateCachedData } from "../../../utils/database/updateCache";
import { TicketTriggerSchema } from "../../../database/modals/Panel";
import { invalidateCache } from "../../../utils/database/invalidateCache";

const cmd: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("ticket_triggers")
    .setDescription("Ticket trigger configuration base")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild)
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
    ),
  async autocomplete(client, interaction) {
    if (!interaction.guildId) return;
    const focused = interaction.options.getFocused(true).name;

    if (focused === "ticket_trigger") {
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
        !userPermissions.panels.manage &&
        !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
      )
        return interaction.editReply(
          (await onError(new Error("Missing manage permission"))).discordMsg
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
          (await onError(new Error("Missing manage permission"))).discordMsg
        );
      const id = interaction.options.getString("ticket_trigger", true);
      const trigger = await getServerTicketTrigger(id, interaction.guildId);
      if (!trigger) {
        const error = (await onError(new Error("Trigger not found")))
          .discordMsg;

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
          (await onError(new Error("Missing manage permission"))).discordMsg
        );
      const id = interaction.options.getString("ticket_trigger", true);
      const trigger = await getServerTicketTrigger(id, interaction.guildId);
      if (!trigger) {
        const error = (await onError(new Error("Trigger not found")))
          .discordMsg;

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
  },
};

export default cmd;
