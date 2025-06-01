import config from "../../config";
import { CommandPermission } from "../../constants/permissions";
import { AppCommand, PrefixCommand } from "../../types/Command";

export const checkCommandPermissions = (
  command: AppCommand | PrefixCommand,
  userId: string
) => {
  if (!command.permissionLevel) return true;
  if (
    command.permissionLevel === CommandPermission.Owner &&
    userId === config.owner
  )
    return true;
  if (
    command.permissionLevel === CommandPermission.Admin &&
    config.admins.includes(userId)
  )
    return true;

  return false;
};
