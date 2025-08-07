import { Client, GuildMember } from "discord.js";
import { guildLeaveQueue, wait } from "..";
import colours from "../constants/colours";
import { t } from "../lang";
import { Event } from "../types/Event";
import { fetchMessageFromUrl } from "../utils/bot/fetchMessage";
import {
  getServer,
  getServerApplications,
  getUserCompletedApplications,
} from "../utils/bot/getServer";
import {
  getAvailableLogChannel,
  postLogToWebhook,
} from "../utils/bot/sendLogToWebhook";
import { invalidateCache } from "../utils/database/invalidateCache";
import logger from "../utils/logger";

const event: Event<"guildMemberRemove"> = {
  name: "guildMemberRemove",
  execute(client, data, member) {
    guildLeaveQueue.add(() =>
      handleGuildMemberRemove(client, data, member as GuildMember)
    );
  },
};

async function handleGuildMemberRemove(
  client: Client,
  data: any,
  member: GuildMember
) {
  logger.debug(
    `Detected guild member remove ${member.user.username} - running application on leave`
  );

  const serverApplications = await getServerApplications(member.guild.id);
  let counters = {
    delete: 0,
    approve: 0,
    reject: 0,
    nothing: 0,
  };

  for (const app of serverApplications) {
    if (app.actionOnUserLeave === "nothing") {
      counters.nothing++;
      continue;
    }

    const userCompleted = await getUserCompletedApplications(
      app._id,
      member.id,
      ["Pending"]
    );

    for (const attempt of userCompleted) {
      const server = await getServer(member.guild.id);

      if (app.actionOnUserLeave === "delete") {
        counters.delete++;
        await attempt.deleteOne();

        await invalidateCache(`completedApps:${app._id}:Pending`);
        await invalidateCache(`completedApps:${app._id}:${member.id}:all`);
        await invalidateCache(`completedApps:${app._id}:${member.id}:Pending`);

        if (attempt.messageLink) {
          const message = await fetchMessageFromUrl(
            client,
            attempt.messageLink
          );
          if (message) {
            await message.delete().catch(() => {});
            if (message.hasThread)
              await message.thread?.delete().catch(() => {});
          }
        }

        const logChannel = getAvailableLogChannel(
          server.settings.logging,
          "applications.delete"
        );

        if (logChannel) {
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
                  title: t(
                    server.preferredLanguage,
                    "DELETE_APPLICATION_LOG_TITLE"
                  ),
                  description: t(
                    server.preferredLanguage,
                    "DELETE_APPLICATION_LOG_BODY",
                    {
                      user: `<@${member.id}>`,
                      staff: `<@${client.user!.id}>`,
                    }
                  ),
                },
              ],
            }
          );
        }
      }

      if (app.actionOnUserLeave === "approve") {
        counters.approve++;
        await attempt.updateOne({ status: "Accepted", closedAt: new Date() });

        await invalidateCache(`completedApps:${app._id}:Pending`);
        await invalidateCache(`completedApps:${app._id}:${member.id}:all`);
        await invalidateCache(`completedApps:${app._id}:${member.id}:Pending`);

        if (attempt.messageLink) {
          const message = await fetchMessageFromUrl(
            client,
            attempt.messageLink
          );
          if (message) {
            await message
              .edit({
                components: [],
                content: t(
                  server.preferredLanguage,
                  "APPLICATION_VERDICT_ACCEPT_HEADER",
                  {
                    user: `<@${client.user!.id}>`,
                    reason: t(server.preferredLanguage, "LEFT_SERVER"),
                  }
                ),
              })
              .catch(() => {});
            if (message.hasThread)
              await message.thread?.setArchived().catch(() => {});
          }
        }

        const logChannel = getAvailableLogChannel(
          server.settings.logging,
          "applications.approve"
        );

        if (logChannel) {
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
                  title: t(
                    server.preferredLanguage,
                    "APPROVE_APPLICATION_LOG_TITLE"
                  ),
                  description: t(
                    server.preferredLanguage,
                    "APPROVE_APPLICATION_LOG_BODY",
                    {
                      user: `<@${member.id}>`,
                      staff: `<@${client.user!.id}>`,
                    }
                  ),
                },
              ],
            }
          );
        }
      }

      if (app.actionOnUserLeave === "reject") {
        counters.reject++;
        await attempt.updateOne({ status: "Rejected", closedAt: new Date() });

        await invalidateCache(`completedApps:${app._id}:Pending`);
        await invalidateCache(`completedApps:${app._id}:${member.id}:all`);
        await invalidateCache(`completedApps:${app._id}:${member.id}:Pending`);

        if (attempt.messageLink) {
          const message = await fetchMessageFromUrl(
            client,
            attempt.messageLink
          );
          if (message) {
            await message
              .edit({
                components: [],
                content: t(
                  server.preferredLanguage,
                  "APPLICATION_VERDICT_REJECT_HEADER",
                  {
                    user: `<@${client.user!.id}>`,
                    reason: t(server.preferredLanguage, "LEFT_SERVER"),
                  }
                ),
              })
              .catch(() => {});
            if (message.hasThread)
              await message.thread?.setArchived().catch(() => {});
          }
        }

        const logChannel = getAvailableLogChannel(
          server.settings.logging,
          "applications.reject"
        );

        if (logChannel) {
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
                  title: t(
                    server.preferredLanguage,
                    "REJECT_APPLICATION_LOG_TITLE"
                  ),
                  description: t(
                    server.preferredLanguage,
                    "REJECT_APPLICATION_LOG_BODY",
                    {
                      user: `<@${member.id}>`,
                      staff: `<@${client.user!.id}>`,
                    }
                  ),
                },
              ],
            }
          );
        }
      }
      await wait(250);
    }
  }

  logger.debug(
    `Finished processing guild member leave event: ${counters.nothing} nothing | ${counters.approve} approved | ${counters.reject} rejected | ${counters.delete} deleted`
  );
}

export default event;
