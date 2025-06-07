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
   const lines = client.guilds.cache.map(guild => {
    const name = guild.name;
    const id = guild.id;
    const memberCount = guild.memberCount ?? "Unknown";

    const vanity = guild.vanityURLCode
      ? `https://discord.gg/${guild.vanityURLCode}`
      : "No vanity URL";

    return `${name} - ${id} | Members: ${memberCount} | Vanity: ${vanity}`;
  });

  const buffer = Buffer.from(lines.join("\n"), "utf-8");
  const attachment = new AttachmentBuilder(buffer, { name: "guilds.txt" });

    message.reply({files:[attachment]})
  },
};

export default command;
