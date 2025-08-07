"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="dab2bbde-ff0f-5991-b77c-303e09057e7a")}catch(e){}}();

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePrefixMessage = exports.loadPrefixCommands = void 0;
const discord_js_1 = require("discord.js");
const node_path_1 = __importDefault(require("node:path"));
const argumentParser_1 = require("../utils/commands/message/argumentParser");
const config_1 = __importDefault(require("../config"));
const load_1 = require("../utils/commands/load");
const permissions_1 = require("../utils/commands/permissions");
const colours_1 = __importDefault(require("../constants/colours"));
const metricsServer_1 = require("../metricsServer");
const onError_1 = require("../utils/onError");
const permissions_2 = require("../constants/permissions");
const lang_1 = require("../lang");
const getCachedElse_1 = require("../utils/database/getCachedElse");
const logger_1 = __importDefault(require("../utils/logger"));
const prefix = config_1.default.prefix;
const prefixCommands = new discord_js_1.Collection();
const loadPrefixCommands = async () => {
    const commandFiles = (0, load_1.loadFilesRecursively)(node_path_1.default.join(__dirname, "../commands/prefix"));
    let totalCommands = 0;
    let totalAliases = 0;
    for (const file of commandFiles) {
        const command = (await Promise.resolve(`${file}`).then(s => __importStar(require(s)))).default;
        prefixCommands.set(command.name, command);
        totalCommands++;
        command.aliases?.forEach((alias) => {
            if (prefixCommands.has(alias)) {
                logger_1.default.warn(`${alias} has already been registered`);
                return;
            }
            prefixCommands.set(alias, command);
            totalAliases++;
        });
    }
    logger_1.default.info(`Loaded ${totalCommands} prefix commands (${totalAliases} aliases)`);
};
exports.loadPrefixCommands = loadPrefixCommands;
const handlePrefixMessage = async (client, data, message) => {
    if (!message.content.startsWith(prefix) || message.author.bot)
        return;
    const blacklists = await Promise.all([
        (0, getCachedElse_1.getCache)(`blacklists:${message.author.id}`),
        (0, getCachedElse_1.getCache)(`blacklists:${message.guildId}`),
    ]);
    if (blacklists[0].cached || blacklists[1].cached) {
        // We know the user is blacklisted, im gonna just use en as locale as this is per-user not server
        message.author
            .send((await (0, onError_1.onError)(new Error((0, lang_1.t)(
        // (
        //   await getServer(interaction.guildId)
        // ).preferredLanguage,
        "en", `BLACKLISTED_${blacklists[0].cached ? "USER" : "SERVER"}`, {
            reason: blacklists[0].data ||
                blacklists[1].data,
        })))).discordMsg)
            .catch((e) => {
            logger_1.default.warn(`Failed to DM user ${message.author.id}`, e);
        });
        return;
    }
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName)
        return;
    const command = prefixCommands.get(commandName);
    if (!command)
        return;
    metricsServer_1.commandsRun.inc({ command: commandName, type: "Prefix" });
    if (!(0, permissions_1.checkCommandPermissions)(command, message.author.id))
        return;
    if ((command.allowedIn === "guilds" || command.allowedIn === "all") &&
        command.permissionLevel &&
        !message.member?.permissions.has(permissions_2.permissionLevels[command.permissionLevel]))
        return;
    if (command.allowedIn === "guilds" && !message.guild)
        return;
    if (command.allowedIn === "dms" && message.guild)
        return;
    const input = args.join(" ");
    const { args: parsedArgs, error, code, context, } = (0, argumentParser_1.parseArgs)(command.usage, input);
    if (error) {
        let reply = {};
        switch (code) {
            case 0:
                reply = {
                    embeds: [
                        {
                            color: parseInt(colours_1.default.error, 16),
                            description: `Missing required argument: \`${context.missing}\`\nUsage: \`${prefix}${command.name} ${command.usage}\``,
                        },
                    ],
                };
                break;
            case 1:
                reply = {
                    embeds: [
                        {
                            color: parseInt(colours_1.default.error, 16),
                            description: `Invalid type: \`${context.arg}\` must be of type ${context.expected} (got \`${context.received}\`)\nUsage: \`${prefix}${command.name} ${command.usage}\``,
                        },
                    ],
                };
                break;
            case 2:
                reply = {
                    embeds: [
                        {
                            color: parseInt(colours_1.default.error, 16),
                            description: `Invalid choice: \`${context.arg}\` must be one of ${context.options
                                .map((o) => `\`${o}\``)
                                .join(",")} (got \`${context.received}\`)\nUsage: \`${prefix}${command.name} ${command.usage}\``,
                        },
                    ],
                };
                break;
            case 3:
                reply = {
                    embeds: [
                        {
                            color: parseInt(colours_1.default.error, 16),
                            description: `Too many arguments: Extra: \`${context.extra.join(" ")}\` (Expected ${context.expected}, got ${context.received})\nUsage: \`${prefix}${command.name} ${command.usage}\``,
                        },
                    ],
                };
                break;
        }
        metricsServer_1.commandErrors.inc({ command: commandName, type: "Prefix", cause: error });
        return message
            .reply(reply)
            .catch((err) => message.reply(`I don't seem to have permission to send embeds here. The error was \`${error}\`.\n-# Please allow me to send embeds for more detail`))
            .then((msg) => setTimeout(async () => {
            if (message.channel.isTextBased() &&
                "bulkDelete" in message.channel) {
                try {
                    await message.channel.bulkDelete([msg, message], true);
                }
                catch {
                    msg.delete().catch(() => { });
                    message.delete().catch(() => { });
                }
            }
            else {
                msg.delete().catch(() => { });
                message.delete().catch(() => { });
            }
        }, 60 * 1000));
    }
    try {
        command.execute(client, data, message, parsedArgs);
    }
    catch (err) {
        logger_1.default.error("Command error", err);
        message.reply((await (0, onError_1.onError)(err, {
            command: commandName,
            args,
            user: message.author.id,
            server: message.guild?.id || "DMs",
        })).discordMsg);
    }
};
exports.handlePrefixMessage = handlePrefixMessage;
//# sourceMappingURL=commandHandler.js.map
//# debugId=dab2bbde-ff0f-5991-b77c-303e09057e7a
