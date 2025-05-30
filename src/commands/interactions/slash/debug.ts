import {
  GuildMember,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import { getUserPermissions } from "../../../utils/calculateUserPermissions";
import {
  getServerGroups,
  getServerGroupsByIds,
  getUserTickets,
} from "../../../utils/bot/getServer";
import colours from "../../../constants/colours";
import { t } from "../../../lang";
import { massCloseManager } from "../../..";
import { closeTicket } from "../../../utils/tickets/close";
import { invalidateCache } from "../../../utils/database/invalidateCache";
import { formatDuration } from "../../../utils/formatters/duration";

const command: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("debug")
    .setDescription("Threaded debugger")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setContexts(InteractionContextType.Guild)
    .setNameLocalizations({})
    .setDescriptionLocalizations({})
    .addSubcommand((cmd) =>
      cmd
        .setName("group_permissions")
        .setDescription("Debug your group permissions")
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .addUserOption((opt) =>
          opt.setName("user").setDescription("The user to check")
        )
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("close_all_tickets")
        .setDescription("If a user is having problems, close ALL their tickets")
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("The user to check")
            .setRequired(true)
        )
    ),

  async execute(client, data, interaction) {
    if (!interaction.guildId) return;
    await interaction.reply({
      content: t(data.lang!, "THINK"),
      flags: [MessageFlags.Ephemeral],
    });

    const subcommand = interaction.options.getSubcommand(true);

    if (subcommand === "group_permissions") {
      const member =
        interaction.options.getMember("user") || interaction.member;
      const permissions = getUserPermissions(
        member as GuildMember,
        await getServerGroups(interaction.guildId)
      );

      interaction.editReply({
        embeds: [
          {
            color: parseInt(colours.info, 16),
            title: t(data.lang!, "DEBUGGER_GROUP_PERMISSIONS_TITLE"),
            description: t(data.lang!, "DEBUGGER_GROUP_PERMISSIONS_BODY"),
          },
          {
            color: parseInt(colours.info, 16),
            description: `\`\`\`json\n${JSON.stringify(
              permissions,
              (_, v) => (typeof v === "bigint" ? v.toString() : v),
              2
            )}\n\`\`\``,
          },
        ],
      });
    } else if (subcommand === "close_all_tickets") {
      const start = new Date().getTime();
      const user = interaction.options.getUser("user", true);
      await invalidateCache(
        `tickets:${interaction.guildId!}:${user.id}:Locked|Open`
      );
      const userTickets = await getUserTickets(interaction.guildId, user.id, [
        "Open",
        "Locked",
      ]);

      let failed = userTickets.length;
      interaction.editReply({
        content: t(data.lang!, "CLOSE_MASS_ACTION", {
          number: userTickets.length,
          user: `<@${user.id}>`,
        }),
      });

      for (const ticket of userTickets) {
        const a = await massCloseManager.wrap(async () => {
          const userPermissions = getUserPermissions(
            interaction.member as GuildMember,
            await getServerGroupsByIds(ticket.groups, interaction.guildId!)
          );

          if (
            !userPermissions.tickets.canClose &&
            !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
          )
            return false;
          await closeTicket(ticket._id, data.lang!);
          return true;
        }, interaction.guildId);
        if (a) failed--;
      }

      interaction.editReply({
        content: t(data.lang!, "CLOSE_MASS_ACTION_DONE", {
          number: userTickets.length - failed,
          user: `<@${user.id}>`,
          failed: failed,
          duration: formatDuration(new Date().getTime() - start),
        }),
      });
    }
  },
};

export default command;
