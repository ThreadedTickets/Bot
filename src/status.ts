import {
  ActivityOptions,
  ActivityType,
  Client,
  PresenceData,
  PresenceStatusData,
} from "discord.js";

/**
 * Sets the bot's status based on environment variables.
 * Only sets what's provided in the environment.
 * @param {Client} client - The Discord.js client instance
 */
export default function setBotStatusFromEnv(client: Client) {
  const presenceData: PresenceData = {
    status: ["online", "idle", "dnd", "invisible"].includes(
      process.env.BOT_STATUS as string
    )
      ? (process.env.BOT_STATUS as PresenceStatusData)
      : "online",
  };

  // Only set activity if both type and text are provided
  if (process.env.BOT_ACTIVITY_TYPE && process.env.BOT_ACTIVITY_TEXT) {
    const activityType = process.env.BOT_ACTIVITY_TYPE.toUpperCase();
    const activity: ActivityOptions = {
      name: process.env.BOT_ACTIVITY_TEXT,
      type:
        ActivityType[activityType as keyof typeof ActivityType] ??
        ActivityType.Playing,
    };

    // Add URL if provided and activity is streaming
    if (
      activity.type === ActivityType.Streaming &&
      process.env.BOT_ACTIVITY_URL
    ) {
      activity.url = process.env.BOT_ACTIVITY_URL;
    }

    presenceData.activities = [activity];
  }

  if (client.user) client.user.setPresence(presenceData);
}
