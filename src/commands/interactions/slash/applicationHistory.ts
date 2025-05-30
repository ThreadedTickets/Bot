import {
  GuildMember,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import { getAnnouncement } from "../../../utils/bot/viewAnnouncement";
import { t } from "../../../lang";
import {
  getServerApplication,
  getServerApplications,
  getServerGroupsByIds,
  getServerLocale,
  getUserCompletedApplications,
} from "../../../utils/bot/getServer";
import { onError } from "../../../utils/onError";
import { getUserPermissions } from "../../../utils/calculateUserPermissions";
import { paginateStrings } from "../../../utils/formatters/paginateStrings";
import { paginateWithButtons } from "../../../utils/paginateWithButtons";

const command: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("application_history")
    .setDescription("Get a user's application history")
    .setNameLocalizations({})
    .setDescriptionLocalizations({})
    .addStringOption((opt) =>
      opt
        .setName("application")
        .setDescription("Select an application")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addUserOption((opt) =>
      opt.setDescription("Select a user").setName("user").setRequired(true)
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
            name: "You have no applications!",
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
    await interaction.reply({
      content: t(data.lang!, "THINK"),
      flags: [MessageFlags.Ephemeral],
    });

    const applicationId = interaction.options.getString("application", true);
    const user = interaction.options.getUser("user", true);
    const application = await getServerApplication(
      applicationId,
      interaction.guildId
    );
    if (!application)
      return interaction.editReply(
        (
          await onError(
            "Tickets",
            t(data.lang!, "CONFIG_CREATE_APPLICATION_NOT_FOUND"),
            {
              applicationId,
              guildId: interaction.guildId,
            }
          )
        ).discordMsg
      );
    const userPermissions = getUserPermissions(
      interaction.member as GuildMember,
      await getServerGroupsByIds(application.groups, interaction.guildId)
    );

    if (
      !userPermissions.applications.manage &&
      !userPermissions.applications.respond &&
      !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
    )
      return interaction.editReply(
        (await onError("Commands", t(data.lang!, "MISSING_PERMISSIONS")))
          .discordMsg
      );

    const allApplications = await getUserCompletedApplications(
      application._id,
      user.id
    );
    if (!allApplications.length)
      return interaction.editReply(
        (await onError("Commands", t(data.lang!, "NO_RECORDS"))).discordMsg
      );

    const applicationHistoryStrings = allApplications
      .map(
        (a) =>
          `<t:${Math.round(
            new Date(a.createdAt).getTime() / 1000
          )}:f>\n> Attempt ID: \`${a._id}\`\n> Status: ${
            a.messageLink
              ? `[\`${a.status}\`](${a.messageLink})`
              : `\`${a.status}\``
          }\n`
      )
      .reverse();

    const paginatedMessages = paginateStrings(
      applicationHistoryStrings,
      5,
      `Applications for ${application?.name ?? "`Unknown application`"}`
    );

    await paginateWithButtons(
      interaction.user.id,
      interaction,
      paginatedMessages
    );
  },
};

export default command;
