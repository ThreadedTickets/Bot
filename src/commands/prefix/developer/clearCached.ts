import { CommandPermission } from "../../../constants/permissions";
import { PrefixCommand } from "../../../types/Command";
import { invalidateCache } from "../../../utils/database/invalidateCache";

const command: PrefixCommand<{
  key: string;
}> = {
  name: "clearcache",
  aliases: ["cc"],
  permissionLevel: CommandPermission.Admin,
  usage: "<key<string>>",
  async execute(client, data, message, args) {
    await invalidateCache(args.key);

    await message.react("✅");
  },
};

export default command;
