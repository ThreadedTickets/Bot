import { APIEmbed } from "discord.js";
import { ErrorSchema } from "../database/modals/Error";
import colours from "../constants/colours";
import { postToWebhook } from "./message/webhookPoster";
import { WebhookTypes } from "../constants/webhooks";
import { errors } from "../metricsServer";
import { t } from "../lang";
import { Locale } from "../types/Locale";
import logger from "./logger";

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
  error: any | string,
  context?: object,
  locale?: Locale
) => {
  const errorDocument = await ErrorSchema.create({
    error: error.message,
    context,
  });
  if (typeof error === "string") error = new Error(error);
  const id = errorDocument._id.toString();
  logger.warn(`Error ${id}`, error);
  errors.inc({ error: error.message });

  postToWebhook(WebhookTypes.ErrorLog, {
    username: id,
    embeds: [
      {
        color: parseInt(colours.error, 16),
        title: `Error ${id}`,
        description: `${error.message}\n\`\`\`\n${
          context ? JSON.stringify(context, null, 2) : "No context"
        }\n\`\`\``,
      },
    ],
  });

  return {
    /**
     * A message formatted so that it can be posted to Discord
     */
    discordMsg: formatDiscordMessage(id, error.message, context, locale),
  };
};
