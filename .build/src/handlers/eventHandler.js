"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="2c5a118c-94c6-59c5-993a-cde0d257c2aa")}catch(e){}}();

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
exports.loadEvents = void 0;
const path_1 = __importDefault(require("path"));
const load_1 = require("../utils/commands/load");
const getCachedElse_1 = require("../utils/database/getCachedElse");
const getServer_1 = require("../utils/bot/getServer");
const loadEvents = async (client) => {
    const eventFiles = (0, load_1.loadFilesRecursively)(path_1.default.join(__dirname, "../events"));
    for (const file of eventFiles) {
        const event = (await Promise.resolve(`${file}`).then(s => __importStar(require(s)))).default;
        const listener = async (...args) => {
            const userId = extractUserId(args);
            const guildId = extractGuildId(args);
            if (!userId && !guildId) {
                return event.execute(client, {}, ...args);
            }
            let blacklist = null;
            let lang = null;
            if (userId) {
                const blacklists = await (0, getCachedElse_1.getCache)(`blacklists:${userId}`);
                if (blacklists.cached) {
                    blacklist = {
                        active: true,
                        reason: blacklists.data,
                        type: "user",
                    };
                }
            }
            if (guildId) {
                if (!blacklist) {
                    const blacklists = await (0, getCachedElse_1.getCache)(`blacklists:${guildId}`);
                    if (blacklists.cached) {
                        blacklist = {
                            active: true,
                            reason: blacklists.data,
                            type: "server",
                        };
                    }
                }
                lang = await (0, getServer_1.getServerLocale)(guildId);
            }
            await event.execute(client, { blacklist, lang }, ...args);
        };
        if (event.once) {
            client.once(event.name, listener);
        }
        else {
            client.on(event.name, listener);
        }
    }
};
exports.loadEvents = loadEvents;
function extractUserId(args) {
    for (const arg of args) {
        if (!arg)
            continue;
        if ("author" in arg && arg.author?.id)
            return arg.author.id; // message
        if ("user" in arg && arg.user?.id)
            return arg.user.id; // member
        if ("id" in arg && !("guild" in arg))
            return arg.id; // user object
    }
    return null;
}
function extractGuildId(args) {
    for (const arg of args) {
        if (!arg)
            continue;
        if ("guildId" in arg && typeof arg.guildId === "string")
            return arg.guildId;
        if ("guild" in arg && arg.guild?.id)
            return arg.guild.id;
        if ("id" in arg && "members" in arg && "name" in arg)
            return arg.id; // guild object
    }
    return null;
}
//# sourceMappingURL=eventHandler.js.map
//# debugId=2c5a118c-94c6-59c5-993a-cde0d257c2aa
