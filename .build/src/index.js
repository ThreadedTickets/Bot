"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = exports.massCloseManager = exports.ticketQueueManager = exports.guildLeaveQueue = exports.InMemoryCache = exports.TaskScheduler = exports.client = void 0;
require("@dotenvx/dotenvx");
const discord_js_1 = require("discord.js");
const eventHandler_1 = require("./handlers/eventHandler");
const connection_1 = require("./database/connection");
require("./utils/hooks/register");
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
const config_1 = __importDefault(require("./config"));
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
        DMMessageManager: 3,
        EntitlementManager: 0,
        GuildBanManager: 0,
        GuildEmojiManager: 0,
        GuildForumThreadManager: 0,
        GuildInviteManager: 0,
        GuildMemberManager: 3,
        GuildMessageManager: 3,
        GuildScheduledEventManager: 0,
        GuildStickerManager: 0,
        GuildTextThreadManager: 3,
        MessageManager: 3,
        PresenceManager: 0,
        ReactionManager: 0,
        ReactionUserManager: 0,
        StageInstanceManager: 0,
        ThreadManager: 3,
        ThreadMemberManager: 3,
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
// @ts-ignore
if (isProd)
    discordClient.cluster = new discord_hybrid_sharding_1.ClusterClient(discordClient);
// @ts-ignore
exports.client = isProd ? clusterClient.client : discordClient;
(0, connection_1.connectToMongooseDatabase)();
(0, eventHandler_1.loadEvents)(exports.client);
if (!config_1.default.isWhiteLabel && isProd) {
    // The metrics server is not currently used
    //startMetricsServer(parseInt(process.env["METRICS_PORT"], 10));
    (0, apiServer_1.startApi)(parseInt(process.env["API_PORT"], 10));
}
exports.TaskScheduler = new Scheduler_1.TaskScheduler();
exports.TaskScheduler.registerTaskFunction("closeTicket", (params) => {
    (0, close_1.closeTicket)(params.ticketId, params.locale, params.reason);
});
exports.TaskScheduler.registerTaskFunction("awaitingReply", (params) => {
    (0, await_reply_1.awaitReply)(params.serverId, params.ticketId, params.action, params.notify);
});
exports.TaskScheduler.loadAndProcessBacklog(1000);
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
//# sourceMappingURL=/src/index.js.map