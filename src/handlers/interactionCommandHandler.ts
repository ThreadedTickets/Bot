import { REST, Routes, ApplicationCommandData } from "discord.js";
import fs from "fs";
import path from "path";
import { AppCommand } from "../types/Command";
import { CommandCache } from "../types/CommandCache";
import { loadFilesRecursively } from "../utils/commands/load";
import { logger } from "../utils/logger";
import "@dotenvx/dotenvx";

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);
const clientId = process.env.DISCORD_CLIENT_ID!;
const testGuildId = process.env.DISCORD_TEST_GUILD!;
const CACHE_PATH = path.join(__dirname, "../../.commandCache.json");

export const appCommands = new Map<string, AppCommand>();

// Load previous command cache
const loadCache = (): CommandCache => {
  if (fs.existsSync(CACHE_PATH)) {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  }
  return {};
};

// Save command cache
const saveCache = (cache: CommandCache) => {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
};

// Reload the commands and check if the files have changed
export const deployAppCommands = async () => {
  const cache = loadCache();
  const newCache: CommandCache = {};
  const files = loadFilesRecursively(
    path.join(__dirname, "../commands/interactions")
  );

  const globalToRegister: ApplicationCommandData[] = [];
  const guildToRegister: ApplicationCommandData[] = [];

  for (const file of files) {
    const command: AppCommand = (await import(file)).default;

    const stats = fs.statSync(file);
    const mtime = stats.mtimeMs;
    const isGuild = command.testGuild ?? false;
    const cached = cache[command.data.name];

    appCommands.set(command.data.name, command);
    newCache[command.data.name] = { mtime, isGuild };

    // Check if the command has been modified based on timestamp or any other changes
    const hasChanged =
      !cached || cached.mtime !== mtime || cached.isGuild !== isGuild;

    if (hasChanged) {
      if (isGuild) {
        guildToRegister.push(command.data.toJSON() as ApplicationCommandData);
      } else {
        globalToRegister.push(command.data.toJSON() as ApplicationCommandData);
      }
    }
  }

  // Only update if there are changes
  if (guildToRegister.length > 0) {
    await rest.put(Routes.applicationGuildCommands(clientId, testGuildId), {
      body: guildToRegister,
    });
    logger(
      "Handlers",
      "Info",
      `Updated ${guildToRegister.length} guild commands`
    );
  }

  if (globalToRegister.length > 0) {
    await rest.put(Routes.applicationCommands(clientId), {
      body: globalToRegister,
    });
    logger(
      "Handlers",
      "Info",
      `Updated ${globalToRegister.length} global commands`
    );
  }

  saveCache(newCache);
};

// Function to reload commands, clearing the current ones in memory
export const reloadAppCommands = async () => {
  appCommands.clear();
  logger("Handlers", "Info", "Cleared existing commands from memory");

  await deployAppCommands();
  logger("Handlers", "Info", "Re-deployed commands");
};
