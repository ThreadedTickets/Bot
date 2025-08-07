import { Channel, Client, Message } from "discord.js";
import logger from "../logger";

/**
 * Fetches a message from a Discord message URL.
 * @param client - The Discord Client instance.
 * @param url - The full Discord message URL.
 * @returns The fetched message, or null if not found or invalid.
 */
export async function fetchMessageFromUrl(
  client: Client,
  url: string
): Promise<Message | null> {
  const match = url.match(
    /https:\/\/(?:canary\.|ptb\.)?discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/
  );

  if (!match) {
    logger.error("Invalid Discord message URL", { url: url });
    return null;
  }

  const [, guildId, channelId, messageId] = match;

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel?.isTextBased()) return null;

    const message = await channel.messages.fetch(messageId);
    return message;
  } catch (err) {
    logger.error("Failed to fetch message:", err);
    return null;
  }
}

export async function fetchChannelById(
  client: Client,
  channelId: string | null
): Promise<Channel | null> {
  if (!channelId) return null;
  try {
    const channel = await client.channels.fetch(channelId);
    return channel ?? null;
  } catch (err) {
    return null; // Handle invalid ID, missing permissions, or deleted channels
  }
}

export async function fetchGuildById(client: Client, guildId: string) {
  try {
    const guild = await client.guilds.fetch(guildId);
    return guild; // This is a Guild object
  } catch (error) {
    logger.error(`Failed to fetch guild`, error);
    return null;
  }
}
