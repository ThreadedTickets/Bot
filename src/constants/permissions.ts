import { PermissionFlagsBits, PermissionResolvable } from "discord.js";

export enum PermissionLevel {
  None,
  Staff,
  Admin,
}

export const permissionLevels: Record<PermissionLevel, PermissionResolvable> = {
  [PermissionLevel.Admin]: [PermissionFlagsBits.Administrator],
  [PermissionLevel.Staff]: [PermissionFlagsBits.ManageMessages],
  [PermissionLevel.None]: [],
};

export enum CommandPermission {
  None,
  Admin,
  Owner,
}
