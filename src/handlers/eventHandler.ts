import path from "path";
import { loadFilesRecursively } from "../utils/commands/load";
import { getCache } from "../utils/database/getCachedElse";
import { Locale } from "../types/Locale";
import { getServerLocale } from "../utils/bot/getServer";
import config from "../config";

export type EventData = {
  blacklist?: {
    active: boolean;
    type: "user" | "server";
    reason: string;
  };
  lang?: Locale;
};

export const loadEvents = async (client: {
  once: (eventName: string, listener: (...args: any[]) => any) => void;
  on: (eventName: string, listener: (...args: any[]) => any) => void;
}) => {
  const eventFiles = loadFilesRecursively(path.join(__dirname, "../events"));

  for (const file of eventFiles) {
    const event = (await import(file)).default;

    const listener = async (...args: any[]) => {
      const userId = extractUserId(args);
      const guildId = extractGuildId(args);

      if (!userId && !guildId) {
        return event.execute(client, {} as EventData, ...args);
      }

      // Stops the bot responding in servers it isn't supposed to
      if (
        config.isWhiteLabel &&
        guildId &&
        !config.whiteLabelServerIds.includes(guildId)
      )
        return;

      let blacklist = null;
      let lang = null;
      if (userId && !config.isWhiteLabel) {
        const blacklists = await getCache(`blacklists:${userId}`);
        if (blacklists.cached) {
          blacklist = {
            active: true,
            reason: blacklists.data,
            type: "user",
          };
        }
      }

      if (guildId && !config.isWhiteLabel) {
        if (!blacklist) {
          const blacklists = await getCache(`blacklists:${guildId}`);
          if (blacklists.cached) {
            blacklist = {
              active: true,
              reason: blacklists.data,
              type: "server",
            };
          }
        }

        lang = await getServerLocale(guildId);
      }

      await event.execute(client, { blacklist, lang } as EventData, ...args);
    };

    if (event.once) {
      client.once(event.name, listener);
    } else {
      client.on(event.name, listener);
    }
  }
};

function extractUserId(args: any[]): string | null {
  for (const arg of args) {
    if (!arg) continue;
    if ("author" in arg && arg.author?.id) return arg.author.id; // message
    if ("user" in arg && arg.user?.id) return arg.user.id; // member
    if ("id" in arg && !("guild" in arg)) return arg.id; // user object
  }
  return null;
}

function extractGuildId(args: any[]): string | null {
  for (const arg of args) {
    if (!arg) continue;
    if ("guildId" in arg && typeof arg.guildId === "string") return arg.guildId;
    if ("guild" in arg && arg.guild?.id) return arg.guild.id;
    if ("id" in arg && "members" in arg && "name" in arg) return arg.id; // guild object
  }
  return null;
}
