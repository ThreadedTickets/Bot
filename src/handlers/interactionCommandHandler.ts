import { REST, Routes, ApplicationCommandData } from "discord.js";
import fs from "fs";
import path from "path";
import { AppCommand } from "../types/Command";
import { CommandCache } from "../types/CommandCache";
import { loadFilesRecursively } from "../utils/commands/load";
import "@dotenvx/dotenvx";
import logger from "../utils/logger";
import config from "../config";

export const appCommands = new Map<string, AppCommand>();

// Reload the commands and check if the files have changed
export const deployAppCommands = async () => {
  const files = loadFilesRecursively(
    path.join(__dirname, "../commands/interactions")
  );

  const globalToRegister: ApplicationCommandData[] = [];
  const guildToRegister: ApplicationCommandData[] = [];

  for (const file of files) {
    const command: AppCommand = (await import(file)).default;

    if (config.isWhiteLabel && command.testGuild) continue;

    appCommands.set(command.data.name, command);
  }
};
