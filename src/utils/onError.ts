import { APIEmbed } from "discord.js";
import { ErrorSchema } from "../database/modals/Error";
import { logger, LogLocation } from "./logger";
import colours from "../constants/colours";
import { postToWebhook } from "./message/webhookPoster";
import { WebhookTypes } from "../constants/webhooks";
import { errors } from "../metricsServer";
import { t } from "../lang";
import { Locale } from "../types/Locale";

const formatDiscordMessage = (
  id: string,
  content: string,
  context?: object,
  locale?: Locale
) => {
  const message = {
    flags: [64],
    content: "",
    components: [],
    embeds: [
      {
        color: parseInt(colours.error, 16),
        title: t(locale || "en", "ERROR_TITLE"),
        description: t(locale || "en", "ERROR_DESCRIPTION", {
          error_message: content,
          support_server: `[support server](${process.env.DISCORD_SUPPORT_INVITE})`,
          error_code: id,
        }),
      },
    ] as APIEmbed[],
  };

  return message;
};

export const onError = async (
  location: LogLocation,
  content: string,
  context?: object,
  locale?: Locale
) => {
  const errorDocument = await ErrorSchema.create({ content, context });
  const id = errorDocument._id.toString();
  logger(location, "Error", content, `Error ${id}`);
  errors.inc({ location: location, error: content });

  postToWebhook(WebhookTypes.ErrorLog, {
    username: id,
    embeds: [
      {
        color: parseInt(colours.error, 16),
        title: `Error ${id}`,
        description: `${content}\n\`\`\`\n${
          context ? JSON.stringify(context, null, 2) : "No context"
        }\n\`\`\``,
      },
    ],
  });

  return {
    /**
     * A message formatted so that it can be posted to Discord
     */
    discordMsg: formatDiscordMessage(id, content, context, locale),
  };
};
