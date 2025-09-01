import { Collection, Client, Message, APIEmbed } from "discord.js";
import { PrefixCommand } from "../types/Command";
import path from "node:path";
import { parseArgs } from "../utils/commands/message/argumentParser";
import config from "../config";
import { loadFilesRecursively } from "../utils/commands/load";
import { checkCommandPermissions } from "../utils/commands/permissions";
import colours from "../constants/colours";
import { commandErrors, commandsRun } from "../metricsServer";
import { onError } from "../utils/onError";
import { permissionLevels } from "../constants/permissions";
import { t } from "../lang";
import { getCache } from "../utils/database/getCachedElse";
import { EventData } from "./eventHandler";
import logger from "../utils/logger";

const prefix = config.prefix;

const prefixCommands = new Collection<string, PrefixCommand<object, any>>();

export const loadPrefixCommands = async () => {
  const commandFiles = loadFilesRecursively(
    path.join(__dirname, "../commands/prefix")
  );

  let totalCommands: number = 0;
  let totalAliases: number = 0;

  for (const file of commandFiles) {
    const command: PrefixCommand = (await import(file)).default;
    prefixCommands.set(command.name, command);
    totalCommands++;

    command.aliases?.forEach((alias) => {
      if (prefixCommands.has(alias)) {
        logger.warn(`${alias} has already been registered`);
        return;
      }
      prefixCommands.set(alias, command);
      totalAliases++;
    });
  }

  logger.info(
    `Loaded ${totalCommands} prefix commands (${totalAliases} aliases)`
  );
};

export const handlePrefixMessage = async (
  client: Client,
  data: EventData,
  message: Message
) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  if (!config.isWhiteLabel) {
    const blacklists = await Promise.all([
      getCache(`blacklists:${message.author.id}`),
      getCache(`blacklists:${message.guildId}`),
    ]);

    if (blacklists[0].cached || blacklists[1].cached) {
      // We know the user is blacklisted, im gonna just use en as locale as this is per-user not server
      message.author
        .send(
          (
            await onError(
              new Error(
                t(
                  // (
                  //   await getServer(interaction.guildId)
                  // ).preferredLanguage,
                  "en",
                  `BLACKLISTED_${blacklists[0].cached ? "USER" : "SERVER"}`,
                  {
                    reason:
                      (blacklists[0].data as string) ||
                      (blacklists[1].data as string),
                  }
                )
              )
            )
          ).discordMsg
        )
        .catch((e) => {
          logger.warn(`Failed to DM user ${message.author.id}`, e);
        });
      return;
    }
  }

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();
  if (!commandName) return;

  const command = prefixCommands.get(commandName);
  if (!command) return;
  commandsRun.inc({ command: commandName, type: "Prefix" });
  if (!checkCommandPermissions(command, message.author.id)) return;
  if (
    (command.allowedIn === "guilds" || command.allowedIn === "all") &&
    command.permissionLevel &&
    !message.member?.permissions.has(permissionLevels[command.permissionLevel])
  )
    return;
  if (command.allowedIn === "guilds" && !message.guild) return;
  if (command.allowedIn === "dms" && message.guild) return;

  const input = args.join(" ");
  const {
    args: parsedArgs,
    error,
    code,
    context,
  } = parseArgs(command.usage, input);

  if (error) {
    let reply = {};

    switch (code) {
      case 0:
        reply = {
          embeds: [
            {
              color: parseInt(colours.error, 16),
              description: `Missing required argument: \`${context.missing}\`\nUsage: \`${prefix}${command.name} ${command.usage}\``,
            },
          ] as APIEmbed,
        };
        break;
      case 1:
        reply = {
          embeds: [
            {
              color: parseInt(colours.error, 16),
              description: `Invalid type: \`${context.arg}\` must be of type ${context.expected} (got \`${context.received}\`)\nUsage: \`${prefix}${command.name} ${command.usage}\``,
            },
          ] as APIEmbed,
        };
        break;
      case 2:
        reply = {
          embeds: [
            {
              color: parseInt(colours.error, 16),
              description: `Invalid choice: \`${
                context.arg
              }\` must be one of ${context.options
                .map((o: string) => `\`${o}\``)
                .join(",")} (got \`${context.received}\`)\nUsage: \`${prefix}${
                command.name
              } ${command.usage}\``,
            },
          ] as APIEmbed,
        };
        break;
      case 3:
        reply = {
          embeds: [
            {
              color: parseInt(colours.error, 16),
              description: `Too many arguments: Extra: \`${context.extra.join(
                " "
              )}\` (Expected ${context.expected}, got ${
                context.received
              })\nUsage: \`${prefix}${command.name} ${command.usage}\``,
            },
          ] as APIEmbed,
        };
        break;
    }
    commandErrors.inc({ command: commandName, type: "Prefix", cause: error });
    return message
      .reply(reply)
      .catch((err) =>
        message.reply(
          `I don't seem to have permission to send embeds here. The error was \`${error}\`.\n-# Please allow me to send embeds for more detail`
        )
      )
      .then((msg) =>
        setTimeout(async () => {
          if (
            message.channel.isTextBased() &&
            "bulkDelete" in message.channel
          ) {
            try {
              await message.channel.bulkDelete([msg, message], true);
            } catch {
              msg.delete().catch(() => {});
              message.delete().catch(() => {});
            }
          } else {
            msg.delete().catch(() => {});
            message.delete().catch(() => {});
          }
        }, 60 * 1000)
      );
  }

  try {
    command.execute(client, data, message, parsedArgs);
  } catch (err: any) {
    logger.error("Command error", err);
    message.reply(
      (
        await onError(err, {
          command: commandName,
          args,
          user: message.author.id,
          server: message.guild?.id || "DMs",
        })
      ).discordMsg
    );
  }
};
