import { CommandPermission } from "../../../constants/permissions";
import { ErrorSchema } from "../../../database/modals/Error";
import { PrefixCommand } from "../../../types/Command";
import { getCachedDataElse } from "../../../utils/database/getCachedElse";
import { toTimeUnit } from "../../../utils/formatters/toTimeUnit";

const cmd: PrefixCommand<{
  error_id: string;
}> = {
  name: "recluster",
  usage: "",
  permissionLevel: CommandPermission.Admin,

  async execute(client, data, message, args) {},
};

export default cmd;
