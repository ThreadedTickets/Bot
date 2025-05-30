import { Guild } from "discord.js";
import colours from "../../constants/colours";
import { CompletedApplicationSchema } from "../../database/modals/CompletedApplications";
import { t } from "../../lang";
import { ModalHandler } from "../../types/Interactions";
import { getGuildMember } from "../../utils/bot/getGuildMember";
import {
  getCompletedApplication,
  getServer,
  getServerApplication,
  getServerMessage,
} from "../../utils/bot/getServer";
import { sendDirectMessage } from "../../utils/bot/sendDirectMessage";
import {
  getAvailableLogChannel,
  postLogToWebhook,
} from "../../utils/bot/sendLogToWebhook";
import { invalidateCache } from "../../utils/database/invalidateCache";
import { updateMemberRoles } from "../../utils/hooks/events/applications/end/roles";
import { generateBasePlaceholderContext } from "../../utils/message/placeholders/generateBaseContext";
import { resolveDiscordMessagePlaceholders } from "../../utils/message/placeholders/resolvePlaceholders";
import { onError } from "../../utils/onError";

const modal: ModalHandler = {
  customId: "rejApp",
  async execute(client, data, interaction) {
    if (!interaction.guildId) return;
    const reason = interaction.fields.getTextInputValue("reason") || "None";
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

    const server = await getServer(interaction.guildId);

    await interaction.deferUpdate();
    if (interaction.message!.hasThread)
      interaction.message!.thread?.setArchived().catch(() => {});

    await CompletedApplicationSchema.findOneAndUpdate(
      { _id: applicationId },
      { status: "Rejected", closedAt: new Date() }
    );

    const member = await getGuildMember(
      client,
      interaction.guildId,
      application.owner
    );
    const applicationTrigger = await getServerApplication(
      application.application,
      interaction.guildId
    );
    if (member && applicationTrigger) {
      await updateMemberRoles(
        client,
        member,
        [
          ...applicationTrigger.removeRolesWhenPending,
          ...applicationTrigger.addRolesOnReject,
        ],
        [
          ...applicationTrigger.addRolesWhenPending,
          ...applicationTrigger.removeRolesOnReject,
        ]
      );
    }

    if (applicationTrigger) {
      await invalidateCache(`completedApps:${applicationTrigger._id}:Pending`);
      await invalidateCache(
        `completedApps:${applicationTrigger._id}:${owner}:all`
      );
      let baseMessage: {
        content?: string;
        embeds?: any[];
      } = {
        embeds: [
          {
            color: parseInt(colours.error, 16),
            description: t(
              server.preferredLanguage,
              "APPLICATION_DEFAULT_MESSAGE_REJECTED",
              {
                applicationName: applicationTrigger.name,
                serverName: interaction.guild!.name,
                reason: reason,
                reviewer: `<@${interaction.user.id}>`,
              }
            ),
          },
        ],
      };

      const customMessage = applicationTrigger.acceptedMessage
        ? await getServerMessage(
            applicationTrigger.acceptedMessage,
            applicationTrigger.server
          )
        : null;

      if (customMessage) {
        baseMessage = {
          content: customMessage.content,
          embeds: customMessage.embeds,
        };
      }
      sendDirectMessage(
        client,
        owner,
        resolveDiscordMessagePlaceholders(baseMessage, {
          ...generateBasePlaceholderContext({
            server: interaction.guild as Guild,
          }),
          applicationName: applicationTrigger.name,
          reason: interaction.guild!.name,
          reviewer: `<@${interaction.user.id}>`,
        })
      );
    }

    interaction
      .message!.edit({
        components: [],
        content: t(
          server.preferredLanguage,
          "APPLICATION_VERDICT_REJECT_HEADER",
          { user: `<@${interaction.user.id}>`, reason }
        ),
      })
      .catch(() => {});

    const logChannel = getAvailableLogChannel(
      server.settings.logging,
      "applications.reject"
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
            title: t(server.preferredLanguage, "REJECT_APPLICATION_LOG_TITLE"),
            description: t(
              server.preferredLanguage,
              `REJECT_APPLICATION_LOG_BODY`,
              {
                user: `<@${owner}>`,
                staff: `<@${interaction.user.id}>`,
                reason,
              }
            ),
          },
        ],
      }
    );
  },
};

export default modal;
