import { ClientUser, TextChannel } from "discord.js";

export async function getOrCreateWebhook(
  channel: TextChannel,
  clientUser: ClientUser
): Promise<string> {
  if (!channel.isTextBased() || channel.isDMBased())
    throw new Error("Invalid channel type");

  const webhooks = await channel.fetchWebhooks();
  const existing = webhooks.find((wh) => wh.owner?.id === clientUser.id);
  if (existing) return existing.url;

  // Create a new webhook if not found
  return (
    await channel.createWebhook({
      name: clientUser.displayName,
      avatar: clientUser.displayAvatarURL() || null,
    })
  ).url;
}
