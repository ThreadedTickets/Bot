import { CommandPermission } from "../../../constants/permissions";
import { PrefixCommand } from "../../../types/Command";
const cmd: PrefixCommand<{
  id: string;
}> = {
  name: "transcript",
  usage: "<id>",
  permissionLevel: CommandPermission.Owner,

  async execute(client, data, message, args) {
    if (!message.guildId) return;
  },
};

export default cmd;
