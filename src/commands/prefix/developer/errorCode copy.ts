import { CommandPermission } from "../../../constants/permissions";
import { renderTranscriptFromJsonl } from "../../../transcript";
import { PrefixCommand } from "../../../types/Command";
import { TranscriptWriter } from "../../../utils/tickets/TranscriptManager";
import fs from "fs";
import path from "path";
const cmd: PrefixCommand<{
  id: string;
}> = {
  name: "transcript",
  usage: "<id>",
  permissionLevel: CommandPermission.Owner,

  async execute(client, data, message, args) {
    if (!message.guildId) return;
    const manager = new TranscriptWriter(args.id);
    const transcriptPath = path.join(process.cwd(), "transcripts", "out.html");

    fs.writeFileSync(
      transcriptPath,
      await renderTranscriptFromJsonl(
        manager.getFilePath(),
        manager.getMeta().users,
        manager.getMeta().metadata
      )
    );
  },
};

export default cmd;
