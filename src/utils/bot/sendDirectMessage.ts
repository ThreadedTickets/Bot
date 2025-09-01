import { Client, MessageCreateOptions, MessagePayload, User } from "discord.js";
import logger from "../logger";

/**
 * Sends a DM to a user by their ID with full message options.
 * @param client - The Discord Client instance.
 * @param userId - The user ID to DM.
 * @param message - The message content or options (string, embeds, etc).
 * @returns The sent message or null if failed.
 */
export async function sendDirectMessage(
  client: Client,
  userId: string,
  message: string | MessagePayload | MessageCreateOptions
) {
  try {
    const user: User = await client.users.fetch(userId);
    if (!user) throw new Error("User not found");

    const sent = await user.send(message);
    return sent;
  } catch (err) {
    logger.warn(`Failed to DM user ${userId}`, err);
    return null;
  }
}
