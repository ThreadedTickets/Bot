import { GuildMember, MessageFlags, PermissionFlagsBits } from "discord.js";
import { ButtonHandler } from "../../types/Interactions";
import { t } from "../../lang";
import {
  getServerApplication,
  getServerGroupsByIds,
  getUserCompletedApplications,
} from "../../utils/bot/getServer";
import { paginateStrings } from "../../utils/formatters/paginateStrings";
import { paginateWithButtons } from "../../utils/paginateWithButtons";
import { getUserPermissions } from "../../utils/calculateUserPermissions";
import { onError } from "../../utils/onError";

const button: ButtonHandler = {
  customId: "appHistory",
  async execute(client, data, interaction) {
    if (!interaction.guildId) return;
    await interaction.reply({
      content: t(data.lang!, "THINK"),
      flags: [MessageFlags.Ephemeral],
    });

    const [, applicationId, userId] = interaction.customId.split(":");
    const application = await getServerApplication(
      applicationId,
      interaction.guildId
    );
    if (!application)
      return interaction.editReply(
        (
          await onError(
            "Commands",
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
      userId
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

export default button;
