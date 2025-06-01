import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { CommandPermission } from "../../../constants/permissions";
import { PrefixCommand } from "../../../types/Command";
import { getServerMessage } from "../../../utils/bot/getServer";
import {
  countAnnouncementViews,
  hasUserViewedAnnouncement,
} from "../../../utils/bot/viewAnnouncement";
import serverMessageToDiscordMessage from "../../../utils/formatters/serverMessageToDiscordMessage";
import redis from "../../../utils/redis";

const command: PrefixCommand<{
  action: "set" | "del" | "view" | "count";
  messageId: string;
  userId: string;
}> = {
  name: "announcement",
  aliases: ["ann"],
  permissionLevel: CommandPermission.Owner,
  usage:
    "<action:(set|del|view|count)> <messageId{action === 'set'}> <userId{action === 'view'}>",
  async execute(client, data, msg, args) {
    if (!msg.guildId) return;
    const { action, messageId, userId } = args;

    if (action === "set") {
      const message = await getServerMessage(messageId, msg.guildId);
      if (!message) return msg.reply("Invalid message");

      const parsedMessage = serverMessageToDiscordMessage(message);

      await redis.set(
        "announcement",
        JSON.stringify({
          ...parsedMessage,
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setURL(process.env["DISCORD_SUPPORT_INVITE"]!)
                .setStyle(ButtonStyle.Link)
                .setLabel("Support Server")
            ),
          ],
        })
      );
      await redis.del("announcement:viewed");

      msg.reply("Done");
    } else if (action === "del") {
      await redis.del("announcement");
      msg.reply("Done");
    } else if (action === "count") {
      msg.reply(`total views: ${await countAnnouncementViews()}`);
    } else if (action === "view") {
      msg.reply(`viewed: ${await hasUserViewedAnnouncement(userId)}`);
    }
  },
};

export default command;
