import { transcriptService } from "../../..";
import { CommandPermission } from "../../../constants/permissions";
import { PrefixCommand } from "../../../types/Command";
const cmd: PrefixCommand<{
  id: string;
}> = {
  name: "services",
  usage: "services",
  permissionLevel: CommandPermission.Owner,

  async execute(client, data, message, args) {
    message.reply(
      `Transcript Service\n` +
        `> Status: ${transcriptService.status}\n` +
        `> Last ping: ${
          transcriptService.lastPing ? `<t:${Math.round(transcriptService.lastPing.getTime() / 1000)}:R>` : "Never"
        }`
    );
  },
};

export default cmd;
