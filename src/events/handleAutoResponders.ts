import { GuildMember } from "discord.js";
import { Event } from "../types/Event";
import {
  findMatchingResponder,
  getServer,
  getServerMessage,
  getServerResponders,
} from "../utils/bot/getServer";
import serverMessageToDiscordMessage from "../utils/formatters/serverMessageToDiscordMessage";
import { generateBasePlaceholderContext } from "../utils/message/placeholders/generateBaseContext";
import { resolveDiscordMessagePlaceholders } from "../utils/message/placeholders/resolvePlaceholders";
import { TicketChannelManager } from "../utils/bot/TicketChannelManager";

const userCooldowns = new Map<string, number>();
const COOLDOWN_TIME = 10 * 1000;

const event: Event<"messageCreate"> = {
  name: "messageCreate",
  once: false,
  async execute(client, data, message) {
    if (message.author.bot || !message.guildId || message.content.length < 7)
      return;
    if (data?.blacklist?.active) return;
    const server = await getServer(message.guildId);
    const { extraAllowedChannels } = server.settings.autoResponders!;
    const isTicketChannel = await new TicketChannelManager().getTicket(
      message.channelId
    );

    if (
      !extraAllowedChannels.includes(message.channel.id) &&
      !isTicketChannel?.allowAutoresponders
    )
      return;

    const userId = message.author.id;
    if (userCooldowns.has(userId)) return;

    const responders = await getServerResponders(message.guildId, true);
    if (!responders.length) return;

    const matchedResponder = findMatchingResponder(message.content, responders);
    if (!matchedResponder) return;

    const reply = await getServerMessage(
      matchedResponder.message,
      message.guildId
    );
    if (!reply) return;

    userCooldowns.set(userId, new Date().getTime());
    setTimeout(() => userCooldowns.delete(userId), COOLDOWN_TIME);

    message.reply(
      resolveDiscordMessagePlaceholders(
        serverMessageToDiscordMessage(reply),
        generateBasePlaceholderContext({
          server: message.guild!,
          channel: message.channel,
          member: message.member as GuildMember,
          user: message.author,
        })
      )
    );
  },
};

export default event;
