import {
  GuildMember,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  User,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import {
  getServerGroupsByIds,
  getServerTicketTrigger,
  getServerTicketTriggers,
} from "../../../utils/bot/getServer";
import { onError } from "../../../utils/onError";
import { t } from "../../../lang";
import { runHooks } from "../../../utils/hooks";
import { TicketTrigger } from "../../../types/Ticket";
import {
  canCreateTicketTarget,
  performTicketChecks,
} from "../../../utils/tickets/performChecks";
import { buildTicketFormModal } from "../../../utils/tickets/buildFormModal";
import { getUserPermissions } from "../../../utils/calculateUserPermissions";
import { ticketQueueManager } from "../../..";

const command: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Open a ticket")
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setNameLocalizations({})
    .setDescriptionLocalizations({})
    .addStringOption((opt) =>
      opt
        .setName("trigger")
        .setDescription("Select a trigger to open a ticket with")
        .setRequired(true)
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .setAutocomplete(true)
    )
    .addUserOption((opt) =>
      opt
        .setName("user")
        .setDescription("Force a user into a ticket (requires permission)")
        .setRequired(false)
    ),

  async autocomplete(client, interaction) {
    if (!interaction.guildId) return;
    const focused = interaction.options.getFocused(true).name;

    if (focused === "trigger") {
      const focusedValue = interaction.options.getString("trigger", true);
      const triggers = await getServerTicketTriggers(interaction.guildId);
      if (!triggers.length) {
        interaction.respond([
          {
            name: "There are no triggers!",
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
    const member = (interaction.options.getMember("user") ||
      interaction.member) as GuildMember;
    const user = (interaction.options.getUser("user") ||
      interaction.user) as User;

    const trigger = await getServerTicketTrigger(
      interaction.options.getString("trigger", true),
      interaction.guildId
    );
    if (!trigger)
      return interaction.reply(
        (
          await onError(
            "Commands",
            t(data.lang!, "CONFIG_CREATE_TICKET_TRIGGER_NOT_FOUND")
          )
        ).discordMsg
      );

    const triggerObject = trigger.toObject();
    const triggerTyped: TicketTrigger = {
      ...triggerObject,
    };

    if (trigger.form.length && interaction.user.id === user.id) {
      const modal = buildTicketFormModal(
        triggerTyped.form,
        `ticket:${trigger._id}`,
        triggerTyped.label
      );

      if (modal instanceof Error)
        return await interaction.reply({
          ...(
            await onError("Tickets", modal.message, { stack: modal.stack })
          ).discordMsg,
          flags: [MessageFlags.Ephemeral],
        });

      return interaction.showModal(modal);
    }

    await interaction.reply({
      content: t(data.lang!, "TICKET_CREATE_PERFORMING_CHECKS"),
      flags: [MessageFlags.Ephemeral],
    });

    const userPermissions = getUserPermissions(
      interaction.member as GuildMember,
      await getServerGroupsByIds(trigger.groups, interaction.guildId)
    );

    if (
      !userPermissions.tickets.canForceOpen &&
      !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
    )
      return interaction.editReply(
        (await onError("Tickets", t(data.lang!, "MISSING_PERMISSIONS")))
          .discordMsg
      );

    ticketQueueManager.wrap(async () => {
      const checks = await performTicketChecks(triggerTyped, member);

      if (!checks.allowed) {
        return interaction.editReply(
          (
            await onError(
              "Commands",
              t(data.lang!, `ERROR_CODE_${checks.error}`)
            )
          ).discordMsg
        );
      }

      const checkTargetChannel = await canCreateTicketTarget(
        interaction.guild!,
        trigger.isThread ? "thread" : "channel",
        trigger.openChannel || interaction.channelId
      );
      if (!checkTargetChannel.allowed)
        return interaction.editReply(
          (
            await onError(
              "Commands",
              t(data.lang!, `ERROR_CODE_${checkTargetChannel.error}`)
            )
          ).discordMsg
        );

      await interaction.editReply({
        content: t(data.lang!, "TICKET_CREATE_CHECKS_PASSED"),
      });

      await runHooks("TicketCreate", {
        client: client,
        guild: interaction.guild!,
        lang: data.lang!,
        messageOrInteraction: interaction,
        owner: member.id,
        responses: [],
        trigger: triggerTyped,
        user: user,
      });
    }, interaction.guildId);
  },
};

export default command;
