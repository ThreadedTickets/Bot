import { CommandPermission } from "../../../constants/permissions";
import { PrefixCommand } from "../../../types/Command";

const command: PrefixCommand<{
  key: string;
}> = {
  name: "guildlist",
  aliases: ["gl"],
  permissionLevel: CommandPermission.Admin,
  async execute(client, data, message, args) {
    const guilds = client.guilds.cache.map(guild => `${guild.name} - ${guild.id}`);
  const content = guilds.join("\n");

  const buffer = Buffer.from(content, "utf-8");
  const attachment = new AttachmentBuilder(buffer, { name: "guilds.txt" });

    message.reply({files:[attachment]})
  },
};

export default command;
