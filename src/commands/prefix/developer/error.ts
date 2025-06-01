import { CommandPermission } from "../../../constants/permissions";
import { ErrorSchema } from "../../../database/modals/Error";
import { PrefixCommand } from "../../../types/Command";
import { getCachedDataElse } from "../../../utils/database/getCachedElse";
import { toTimeUnit } from "../../../utils/formatters/toTimeUnit";

const cmd: PrefixCommand<{
  error_id: string;
}> = {
  name: "error",
  usage: "<error_id>",
  aliases: ["e", "err"],
  permissionLevel: CommandPermission.Admin,

  async execute(client, data, message, args) {
    const fetch = await getCachedDataElse(
      `errors:${args.error_id}`,
      toTimeUnit("seconds", 0, 10, 0, 0),
      async () => {
        return await ErrorSchema.findById(args.error_id).catch((err) => {
          return null;
        });
      }
    );

    message.reply({ content: JSON.stringify(fetch.data, null, 2) });
  },
};

export default cmd;
