import { Client, GuildMember } from "discord.js";
import logger from "../logger";

export async function getGuildMember(
  client: Client,
  guildId: string,
  userId: string
): Promise<GuildMember | null> {
  try {
    const guild = await client.guilds.fetch(guildId);
    if (!guild) throw new Error("Guild not found");

    const member = await guild.members.fetch(userId);
    return member;
  } catch (error) {
    logger.warn(`Failed to fetch member ${userId} in guild ${guildId}`, error);
    return null;
  }
}
