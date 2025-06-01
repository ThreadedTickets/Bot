import { t } from "../../lang";
import { ButtonHandler } from "../../types/Interactions";
import {
  getCompletedApplication,
  getServer,
  getServerApplication,
  getServerGroupsByIds,
} from "../../utils/bot/getServer";
import { onError } from "../../utils/onError";
import { invalidateCache } from "../../utils/database/invalidateCache";
import {
  getAvailableLogChannel,
  postLogToWebhook,
} from "../../utils/bot/sendLogToWebhook";
import colours from "../../constants/colours";
import { getGuildMember } from "../../utils/bot/getGuildMember";
import { updateMemberRoles } from "../../utils/hooks/events/applications/end/roles";
import { CompletedApplicationSchema } from "../../database/modals/CompletedApplications";
import { getUserPermissions } from "../../utils/calculateUserPermissions";
import { GuildMember, PermissionFlagsBits } from "discord.js";

const button: ButtonHandler = {
  customId: "delApp",
  async execute(client, data, interaction) {
    if (!interaction.guildId) return;
    const [, applicationId, owner] = interaction.customId.split(":");
    const application = await getCompletedApplication(applicationId, owner);
    if (!application)
      return interaction.reply(
        (
          await onError(
            "Commands",
            t(data.lang!, "CONFIG_CREATE_APPLICATION_NOT_FOUND")
          )
        ).discordMsg
      );

    if (application.status !== "Pending")
      return interaction.reply(
        (await onError("Commands", t(data.lang!, "APPLICATION_NOT_PENDING")))
          .discordMsg
      );
    const applicationTrigger = await getServerApplication(
      application.application,
      interaction.guildId
    );
    if (!applicationTrigger)
      return interaction.reply(
        (
          await onError(
            "Commands",
            t(data.lang!, "CONFIG_CREATE_APPLICATION_NOT_FOUND")
          )
        ).discordMsg
      );
    const userPermissions = getUserPermissions(
      interaction.member as GuildMember,
      await getServerGroupsByIds(applicationTrigger.groups, interaction.guildId)
    );
    if (
      !userPermissions.applications.respond &&
      !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
    )
      return interaction.reply(
        (await onError("Commands", t(data.lang!, "MISSING_PERMISSIONS")))
          .discordMsg
      );

    const server = await getServer(interaction.guildId);

    await interaction.deferUpdate();
    interaction.message.delete().catch(() => {});
    if (interaction.message.hasThread)
      interaction.message.thread?.delete().catch(() => {});

    await invalidateCache(`completedApps:${applicationTrigger._id}:Pending`);
    await invalidateCache(
      `completedApps:${applicationTrigger._id}:${owner}:all`
    );
    await CompletedApplicationSchema.findOneAndDelete({ _id: applicationId });

    const member = await getGuildMember(
      client,
      interaction.guildId,
      application.owner
    );
    if (member && applicationTrigger) {
      await updateMemberRoles(
        client,
        member,
        applicationTrigger.removeRolesWhenPending,
        applicationTrigger.addRolesWhenPending
      );
    }

    const logChannel = getAvailableLogChannel(
      server.settings.logging,
      "applications.delete"
    );
    if (!logChannel) return;

    await postLogToWebhook(
      client,
      {
        channel: logChannel.channel!,
        enabled: logChannel.enabled,
        webhook: logChannel.webhook!,
      },
      {
        embeds: [
          {
            color: parseInt(colours.info, 16),
            title: t(server.preferredLanguage, "DELETE_APPLICATION_LOG_TITLE"),
            description: t(
              server.preferredLanguage,
              `DELETE_APPLICATION_LOG_BODY`,
              {
                user: `<@${owner}>`,
                staff: `<@${interaction.user.id}>`,
              }
            ),
          },
        ],
      }
    );
  },
};

export default button;
