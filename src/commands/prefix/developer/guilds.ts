import { CommandPermission } from "../../../constants/permissions";
import { PrefixCommand } from "../../../types/Command";
import {AttachmentBuilder} from "discord.js"

const command: PrefixCommand<{
  key: string;
}> = {
  name: "guildlist",
  aliases: ["gl"],
  usage: "gl",
  permissionLevel: CommandPermission.Owner,
  async execute(client, data, message, args) {
    const guilds = client.guilds.cache.map(guild => `${guild.name} - ${guild.id}`);
  const content = guilds.join("\n");

  const buffer = Buffer.from(content, "utf-8");
  const attachment = new AttachmentBuilder(buffer, { name: "guilds.txt" });

    message.reply({files:[attachment]})
  },
};

export default command;
