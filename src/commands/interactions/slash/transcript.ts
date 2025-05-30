import {
  GuildMember,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import { t } from "../../../lang";
import {
  getServerGroupsByIds,
  getTicket,
  getTickets,
} from "../../../utils/bot/getServer";
import { onError } from "../../../utils/onError";
import { getUserPermissions } from "../../../utils/calculateUserPermissions";
import path from "path";
import fs from "fs";
import { formatDate } from "../../../utils/formatters/date";

const command: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("transcript")
    .setDescription("Get a ticket transcript")
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setNameLocalizations({})
    .setDescriptionLocalizations({})
    .addStringOption((opt) =>
      opt
        .setName("ticket")
        .setDescription("The ticket to view the transcript of")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(client, interaction) {
    if (!interaction.guildId) return;
    const focused = interaction.options.getFocused(true).name;

    if (focused === "ticket") {
      const focusedValue = interaction.options.getString("ticket", true);
      const tickets = await getTickets(interaction.guildId, ["Closed"]);
      if (!tickets.length) {
        interaction.respond([
          {
            name: "There are no closed tickets",
            value: "",
          },
        ]);
        return;
      }

      const filtered = tickets.filter(
        (m) =>
          m._id.toLowerCase().includes(focusedValue.toLowerCase()) ||
          m.owner.includes(focusedValue.toLowerCase())
      );

      interaction.respond(
        filtered
          .map((m) => ({
            name: `[${formatDate(m.createdAt, "DD/MM/YY")}] [${m.owner}] ${
              m._id
            }`.slice(0, 100),
            value: m._id,
          }))
          .slice(0, 25)
      );
    }
  },

  async execute(client, data, interaction) {
    if (!interaction.guildId) return;
    const ticketId = interaction.options.getString("ticket", true);
    if (!ticketId)
      return interaction.reply(
        (
          await onError("Tickets", t(data.lang!, "TRANSCRIPT_NOT_FOUND"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );
    const ticket = await getTicket(ticketId, interaction.guildId);
    if (!ticket)
      return interaction.reply(
        (
          await onError("Tickets", t(data.lang!, "TRANSCRIPT_NOT_FOUND"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );
    const userPermissions = getUserPermissions(
      interaction.member as GuildMember,
      await getServerGroupsByIds(ticket.groups, interaction.guildId)
    );

    if (
      ((ticket.isRaised && !userPermissions.tickets.canViewLockedTranscripts) ||
        (!ticket.isRaised && !userPermissions.tickets.canViewTranscripts)) &&
      !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
    )
      return interaction.reply(
        (
          await onError("Tickets", t(data.lang!, "MISSING_PERMISSIONS"), {
            ticketId: ticketId,
          })
        ).discordMsg
      );

    await interaction.reply({
      content: t(data.lang!, "THINK"),
      flags: [MessageFlags.Ephemeral],
    });

    const transcriptPath = path.join(
      process.cwd(),
      "transcripts",
      `${ticket.isRaised ? "LOCKED_" : ""}${ticketId}.html`
    );
    if (!fs.existsSync(transcriptPath))
      return interaction.editReply(
        (
          await onError("Tickets", t(data.lang!, "TRANSCRIPT_NOT_FOUND"), {
            ticketId: ticketId,
            path: transcriptPath,
          })
        ).discordMsg
      );

    interaction
      .editReply({
        content: "",
        files: [transcriptPath],
      })
      .catch(async (err) => {
        interaction.editReply(
          (
            await onError("Tickets", err, {
              ticketId: ticketId,
              path: transcriptPath,
            })
          ).discordMsg
        );
      });
  },
};

export default command;
