import { APIEmbed } from "discord.js";

export type WebhookContent = {
  content?: string;
  embeds?: APIEmbed[];
  username?: string;
  avatar_url?: string;
  files?: string[];
};
