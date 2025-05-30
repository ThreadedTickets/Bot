import {
  Client,
  ContextMenuCommandBuilder,
  Message,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  SlashCommandBuilder,
  AutocompleteInteraction,
  SlashCommandSubcommandsOnlyBuilder,
  ChatInputCommandInteraction,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import { CommandPermission, PermissionLevel } from "../constants/permissions";
import { EventData } from "../handlers/eventHandler";

export type ArgType = "string" | "number" | "boolean";

export interface ArgSpec {
  name: string;
  type: ArgType;
  optional: boolean;
  rest?: boolean;
  choices?: string[];
  condition?: string;
  default?: string;
}

export interface PrefixCommand<
  TArgs extends Record<string, any> = {},
  TAllowedIn extends "guilds" | "dms" | "all" = "all"
> {
  name: string;
  aliases?: string[];
  /**
   *
   */
  usage: string;
  permissionLevel?: CommandPermission;
  discordPermission?: PermissionLevel;
  allowedIn?: TAllowedIn;
  execute: (
    client: Client,
    data: EventData,
    message: TAllowedIn extends "guilds"
      ? Message<true>
      : TAllowedIn extends "dms"
      ? Message<false>
      : Message,
    args: TArgs
  ) => unknown;
}

type ChatInputCommand = {
  type: "slash";
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | SlashCommandOptionsOnlyBuilder;
  permissionLevel?: CommandPermission;
  testGuild?: boolean;
  execute: (
    client: Client,
    data: EventData,
    interaction: ChatInputCommandInteraction
  ) => unknown;
  autocomplete?: (
    client: Client,
    interaction: AutocompleteInteraction
  ) => unknown;
};

type UserContextCommand = {
  type: "user";
  data: ContextMenuCommandBuilder;
  permissionLevel?: CommandPermission;
  testGuild?: boolean;
  execute: (
    client: Client,
    data: EventData,
    interaction: UserContextMenuCommandInteraction
  ) => unknown;
};

type MessageContextCommand = {
  type: "message";
  data: ContextMenuCommandBuilder;
  permissionLevel?: CommandPermission;
  testGuild?: boolean;
  execute: (
    client: Client,
    data: EventData,
    interaction: MessageContextMenuCommandInteraction
  ) => unknown;
};

export type AppCommand =
  | ChatInputCommand
  | UserContextCommand
  | MessageContextCommand;
