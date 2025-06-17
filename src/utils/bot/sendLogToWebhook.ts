import {
  Client,
  TextChannel,
  WebhookClient,
  ChannelType,
  APIEmbed,
} from "discord.js";
import { WebhookContent } from "../../types/WebhookContent";
import { logger } from "../logger";
import { getCachedDataElse } from "../database/getCachedElse";
import { toTimeUnit } from "../formatters/toTimeUnit";
import { GuildSchema } from "../../database/modals/Guild";
import { updateCachedData } from "../database/updateCache";
import {
  LogChannel,
  LoggingSettings,
} from "../../commands/interactions/slash/logging";

export type LogConfig = {
  enabled: boolean;
  channel: string;
  webhook: string;
};

const createWebhook = async (channel: TextChannel, client: Client) => {
  return await channel.createWebhook({
    name: `${client.user?.username || "Logger"}`,
    avatar: client.user?.displayAvatarURL(),
  });
};

// Recursively update webhook URLs in the provided logging configuration
const updateWebhookInLoggingConfig = async (
  config: any,
  oldWebhookUrl: string,
  newWebhookUrl: string
) => {
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === "object") {
      await updateWebhookInLoggingConfig(value, oldWebhookUrl, newWebhookUrl);
    } else if (key === "webhook" && value === oldWebhookUrl) {
      config[key] = newWebhookUrl;
    }
  }
};

export const postLogToWebhook = async (
  client: Client,
  logConfig: LogConfig,
  content: WebhookContent
) => {
  if (!logConfig.enabled || !logConfig.channel) return;

  let webhookClient: WebhookClient | null = null;

  const guild = client.guilds.cache.find((g) =>
    g.channels.cache.has(logConfig.channel)
  );
  if (!guild) return;

  const channel = guild.channels.cache.get(logConfig.channel);
  if (!channel || !channel.isTextBased()) {
    await updateLoggingConfigToNull(guild.id, logConfig);
    return;
  }

  // Prepare the webhook channel (either the thread's parent or the text channel)
  let webhookChannel: TextChannel;
  if (channel.isThread()) {
    if (!channel.parent || !channel.parent.isTextBased()) return;
    webhookChannel = channel.parent as TextChannel;
  } else if (channel.type === ChannelType.GuildText) {
    webhookChannel = channel;
  } else {
    return;
  }

  // If no webhook URL, create one before attempting to send
  if (!logConfig.webhook) {
    try {
      const newWebhook = await createWebhook(webhookChannel, client);
      logConfig.webhook = newWebhook.url;
      webhookClient = new WebhookClient({ url: newWebhook.url });

      const { data: document } = await getCachedDataElse(
        `guilds:${guild.id}`,
        toTimeUnit("seconds", 0, 30),
        async () =>
          await GuildSchema.findOneAndUpdate(
            { id: guild.id },
            { $setOnInsert: { id: guild.id } },
            { upsert: true, new: true }
          ),
        GuildSchema
      );

      await updateWebhookInLoggingConfig(document.settings.logging, "", newWebhook.url);
      await document.save();

      updateCachedData(
        `guilds:${guild.id}`,
        toTimeUnit("seconds", 0, 30),
        document.toObject()
      );

      logger(
        "Webhooks",
        "Info",
        `Created new webhook for guild ${guild.id} as none existed`
      );
    } catch (err) {
      logger("Webhooks", "Error", `Failed to create missing webhook: ${err}`);
      return;
    }
  } else {
    webhookClient = new WebhookClient({ url: logConfig.webhook });
  }

  try {
    await webhookClient.send(content);
  } catch (error) {
    logger("Webhooks", "Warn", `Initial webhook send failed, attempting recovery: ${error}`);

    try {
      const newWebhook = await createWebhook(webhookChannel, client);
      const oldWebhookUrl = logConfig.webhook;
      logConfig.webhook = newWebhook.url;
      webhookClient = new WebhookClient({ url: newWebhook.url });

      const { data: document } = await getCachedDataElse(
        `guilds:${guild.id}`,
        toTimeUnit("seconds", 0, 30),
        async () =>
          await GuildSchema.findOneAndUpdate(
            { id: guild.id },
            { $setOnInsert: { id: guild.id } },
            { upsert: true, new: true }
          ),
        GuildSchema
      );

      await updateWebhookInLoggingConfig(
        document.settings.logging,
        oldWebhookUrl,
        newWebhook.url
      );

      await document.save();

      updateCachedData(
        `guilds:${guild.id}`,
        toTimeUnit("seconds", 0, 30),
        document.toObject()
      );

      logger(
        "Webhooks",
        "Info",
        `Recovered webhook for guild ${guild.id}`
      );

      await webhookClient.send({
        ...content,
        embeds: [...(content.embeds as APIEmbed[])],
      });
    } catch (err) {
      logger("Webhooks", "Error", `Failed to recreate deleted webhook: ${err}`);
    }
  }
};


// Helper function to disable logging and set webhook and channel to null
const updateLoggingConfigToNull = async (
  guildId: string,
  logConfig: LogConfig
) => {
  try {
    const document = await GuildSchema.findOne({ id: guildId });

    if (!document) {
      logger("Webhooks", "Error", `Guild ${guildId} not found.`);
      return;
    }

    // Disable logging and set the channel and webhook to null
    for (const category in document.settings.logging) {
      for (const subCategory in (document.settings.logging as any)[
        category as string
      ]) {
        const setting = (document.settings.logging as any)[category][
          subCategory
        ];
        if (setting.webhook === logConfig.webhook) {
          setting.webhook = null;
          setting.channel = null;
          setting.enabled = false;
        }
      }
    }

    // Save the updated document
    await document.save();

    // Update cache
    updateCachedData(
      `guilds:${guildId}`,
      toTimeUnit("seconds", 0, 30),
      document.toObject()
    );

    logger(
      "Webhooks",
      "Info",
      `Logging has been disabled for guild ${guildId} and the webhook/channel set to null.`
    );
  } catch (err) {
    logger(
      "Webhooks",
      "Error",
      `Failed to update logging config for guild ${guildId}: ${err}`
    );
  }
};

type LoggingEvent =
  | "general"
  | "tickets.feedback"
  | "tickets.open"
  | "tickets.close"
  | "tickets.lock"
  | "tickets.unlock"
  | "tickets.raise"
  | "tickets.lower"
  | "tickets.move"
  | "tickets.transcripts"
  | "applications.create"
  | "applications.approve"
  | "applications.reject"
  | "applications.delete";

/**
 *
 * @param logConfig
 * @param event
 * @returns A function that will return the log config for a channel based on the given log event
 */
export function getAvailableLogChannel(
  logConfig: LoggingSettings,
  event: LoggingEvent | (string & {})
): LogChannel | null {
  const parts = event.split(".");

  let current: any = logConfig;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      current = null;
      break;
    }
  }

  if (
    current &&
    typeof current === "object" &&
    "enabled" in current &&
    current.enabled
  ) {
    return current as LogChannel;
  }

  if (logConfig.general && logConfig.general.enabled && current.enabled) {
    return logConfig.general;
  }

  return null;
}
