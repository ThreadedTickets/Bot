import { Client, APIEmbed } from "discord.js";
import logger from "../logger";

export async function sendMessageToChannel(
  client: Client,
  guildId: string,
  channelId: string,
  message: string | { content?: string; embeds?: APIEmbed[]; components: any[] }
) {
  try {
    const guild = await client.guilds.fetch(guildId);
    if (!guild) throw new Error("Guild not found");

    const channel = await guild.channels.fetch(channelId);
    if (!channel) throw new Error("Channel not found");
    if (!channel.isTextBased())
      throw new Error("Channel is not a text channel");

    const msg = await channel.send(
      typeof message === "string" ? { content: message } : message
    );

    logger.debug(
      `Message sent to channel (${guildId}-${channelId}): ${msg.id}`
    );

    return msg;
  } catch (err) {
    logger.warn(`Failed to send message to channel`, err);
  }
}
