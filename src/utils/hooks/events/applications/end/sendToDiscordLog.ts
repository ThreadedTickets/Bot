import { Client } from "discord.js";
import { registerHook } from "../../..";
import {
  Application,
  ApplicationQuestion,
} from "../../../../../types/Application";
import { getServer } from "../../../../bot/getServer";
import {
  getAvailableLogChannel,
  postLogToWebhook,
} from "../../../../bot/sendLogToWebhook";
import colours from "../../../../../constants/colours";
import { t } from "../../../../../lang";

registerHook(
  "ApplicationEnd",
  async ({
    client,
    application,
    responses,
    owner,
  }: {
    client: Client;
    application: Application;
    responses: {
      applicationId: string;
      startTime: Date;
      server: string;
      questionNumber: number;
      questions: ApplicationQuestion[];

      responses: { question: string; response: string }[];
    };
    owner: string;
  }) => {
    const server = await getServer(application.server);
    const logChannel = getAvailableLogChannel(
      server.settings.logging,
      "applications.create"
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
            title: t(server.preferredLanguage, "NEW_APPLICATION_LOG_TITLE"),
            description: t(
              server.preferredLanguage,
              `NEW_APPLICATION_LOG_BODY`,
              {
                user: `<@${owner}>`,
                application: application.name,
              }
            ),
          },
        ],
      }
    );
  }
);
