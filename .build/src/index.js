"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="654608c3-ae3d-5644-b17d-b607b87a4301")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = exports.massCloseManager = exports.ticketQueueManager = exports.guildLeaveQueue = exports.InMemoryCache = exports.TaskScheduler = exports.client = exports.clusterClient = void 0;
require("@dotenvx/dotenvx");
const discord_js_1 = require("discord.js");
const commandHandler_1 = require("./handlers/commandHandler");
const interactionCommandHandler_1 = require("./handlers/interactionCommandHandler");
const eventHandler_1 = require("./handlers/eventHandler");
const connection_1 = require("./database/connection");
const metricsServer_1 = require("./metricsServer");
const interactionHandlers_1 = require("./handlers/interactionHandlers");
require("./utils/hooks/register");
const lang_1 = require("./lang");
const apiServer_1 = require("./apiServer");
const InMemoryCache_1 = require("./utils/database/InMemoryCache");
const p_queue_1 = __importDefault(require("p-queue"));
const Scheduler_1 = require("./utils/Scheduler");
const close_1 = require("./utils/tickets/close");
const QueueManager_1 = require("./utils/bot/QueueManager");
const discord_hybrid_sharding_1 = require("discord-hybrid-sharding");
const logger_1 = __importDefault(require("./utils/logger"));
require("./instrument");
const await_reply_1 = require("./utils/tickets/await-reply");
const isProd = process.env["IS_PROD"] === "true";
const shardList = isProd ? (0, discord_hybrid_sharding_1.getInfo)().SHARD_LIST : [0];
const totalShards = isProd ? (0, discord_hybrid_sharding_1.getInfo)().TOTAL_SHARDS : 1;
const discordClient = new discord_js_1.Client({
    shards: shardList,
    shardCount: totalShards,
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.DirectMessages,
        discord_js_1.GatewayIntentBits.GuildMembers,
    ],
    partials: [discord_js_1.Partials.Channel],
    makeCache: discord_js_1.Options.cacheWithLimits({
        ApplicationCommandManager: 0,
        ApplicationEmojiManager: 0,
        AutoModerationRuleManager: 0,
        BaseGuildEmojiManager: 0,
        DMMessageManager: 100,
        EntitlementManager: 0,
        GuildBanManager: 0,
        GuildEmojiManager: 0,
        GuildForumThreadManager: 0,
        GuildInviteManager: 0,
        GuildMemberManager: 100,
        GuildMessageManager: 100,
        GuildScheduledEventManager: 0,
        GuildStickerManager: 0,
        GuildTextThreadManager: 100,
        MessageManager: 100,
        PresenceManager: 0,
        ReactionManager: 0,
        ReactionUserManager: 0,
        StageInstanceManager: 0,
        ThreadManager: 100,
        ThreadMemberManager: 50,
        UserManager: 0,
        VoiceStateManager: 0,
    }),
    sweepers: {
        ...discord_js_1.Options.DefaultSweeperSettings,
        messages: {
            interval: 3600, // Every hour.
            lifetime: 1800, // Remove messages older than 30 minutes.
        },
        users: {
            interval: 3600,
            filter: () => (user) => user.id !== process.env["DISCORD_CLIENT_ID"], // Remove all bots.
        },
        threadMembers: {
            interval: 3600,
            filter: () => (user) => user.id !== process.env["DISCORD_CLIENT_ID"],
        },
        threads: {
            interval: 3600,
            lifetime: 1800,
        },
    },
});
exports.clusterClient = isProd
    ? new discord_hybrid_sharding_1.ClusterClient(discordClient)
    : discordClient;
// @ts-ignore
exports.client = isProd ? exports.clusterClient.client : discordClient;
(0, commandHandler_1.loadPrefixCommands)();
(0, interactionCommandHandler_1.deployAppCommands)();
(0, eventHandler_1.loadEvents)(exports.client);
(0, connection_1.connectToMongooseDatabase)();
(0, metricsServer_1.startMetricsServer)(parseInt(process.env["METRICS_PORT"], 10));
(0, apiServer_1.startApi)(parseInt(process.env["API_PORT"], 10));
(0, interactionHandlers_1.loadInteractionHandlers)();
(0, lang_1.loadLanguages)();
exports.TaskScheduler = new Scheduler_1.TaskScheduler();
exports.TaskScheduler.registerTaskFunction("closeTicket", (params) => {
    (0, close_1.closeTicket)(params.ticketId, params.locale, params.reason);
});
exports.TaskScheduler.registerTaskFunction("awaitingReply", (params) => {
    (0, await_reply_1.awaitReply)(params.serverId, params.ticketId, params.action, params.notify);
});
exports.InMemoryCache = new InMemoryCache_1.InMemoryCache({
    defaultTTL: 1000 * 10 * 60, // 10 minutes
    cleanupInterval: 1000 * 10, // 10 seconds
    groupLimits: {
        "responders:": 100,
    },
});
exports.guildLeaveQueue = new p_queue_1.default({
    concurrency: 1,
    interval: 5000, // 1 second window
    intervalCap: 1, // 1 task per second
});
exports.ticketQueueManager = new QueueManager_1.AsyncQueueManager();
exports.massCloseManager = new QueueManager_1.AsyncQueueManager();
const wait = (ms) => new Promise((res) => setTimeout(res, ms));
exports.wait = wait;
exports.client.login(process.env["DISCORD_TOKEN"]);
process.on("unhandledRejection", (err) => logger_1.default.error("Unhandled Rejection", err));
process.on("uncaughtException", (err) => logger_1.default.error("Uncaught Exception", err));
//# sourceMappingURL=index.js.map
//# debugId=654608c3-ae3d-5644-b17d-b607b87a4301
