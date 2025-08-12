"use strict";
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
exports.reloadAppCommands = exports.deployAppCommands = exports.appCommands = void 0;
const discord_js_1 = require("discord.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const load_1 = require("../utils/commands/load");
require("@dotenvx/dotenvx");
const logger_1 = __importDefault(require("../utils/logger"));
const config_1 = __importDefault(require("../config"));
const rest = new discord_js_1.REST().setToken(process.env.DISCORD_TOKEN);
const clientId = process.env.DISCORD_CLIENT_ID;
const testGuildId = process.env.DISCORD_TEST_GUILD;
const CACHE_PATH = path_1.default.join(__dirname, "../../.commandCache.json");
exports.appCommands = new Map();
// Load previous command cache
const loadCache = () => {
    if (fs_1.default.existsSync(CACHE_PATH)) {
        return JSON.parse(fs_1.default.readFileSync(CACHE_PATH, "utf8"));
    }
    return {};
};
// Save command cache
const saveCache = (cache) => {
    fs_1.default.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
};
// Reload the commands and check if the files have changed
const deployAppCommands = async () => {
    const cache = loadCache();
    const newCache = {};
    const files = (0, load_1.loadFilesRecursively)(path_1.default.join(__dirname, "../commands/interactions"));
    const globalToRegister = [];
    const guildToRegister = [];
    for (const file of files) {
        const command = (await Promise.resolve(`${file}`).then(s => __importStar(require(s)))).default;
        if (config_1.default.isWhiteLabel && command.testGuild)
            continue;
        const stats = fs_1.default.statSync(file);
        const mtime = stats.mtimeMs;
        const isGuild = command.testGuild ?? false;
        const cached = cache[command.data.name];
        exports.appCommands.set(command.data.name, command);
        newCache[command.data.name] = { mtime, isGuild };
        // Check if the command has been modified based on timestamp or any other changes
        const hasChanged = !cached || cached.mtime !== mtime || cached.isGuild !== isGuild;
        if (hasChanged) {
            if (isGuild) {
                guildToRegister.push(command.data.toJSON());
            }
            else {
                globalToRegister.push(command.data.toJSON());
            }
        }
    }
    // Only update if there are changes
    if (guildToRegister.length > 0) {
        await rest.put(discord_js_1.Routes.applicationGuildCommands(clientId, testGuildId), {
            body: guildToRegister,
        });
        logger_1.default.info(`Updated ${guildToRegister.length} guild commands`);
    }
    if (globalToRegister.length > 0) {
        await rest.put(discord_js_1.Routes.applicationCommands(clientId), {
            body: globalToRegister,
        });
        logger_1.default.info(`Updated ${globalToRegister.length} global commands`);
    }
    saveCache(newCache);
};
exports.deployAppCommands = deployAppCommands;
// Function to reload commands, clearing the current ones in memory
const reloadAppCommands = async () => {
    exports.appCommands.clear();
    logger_1.default.info("Cleared existing commands from memory");
    await (0, exports.deployAppCommands)();
    logger_1.default.info("Re-deployed commands");
};
exports.reloadAppCommands = reloadAppCommands;
//# sourceMappingURL=/src/handlers/interactionCommandHandler.js.map