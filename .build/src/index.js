"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = exports.massCloseManager = exports.ticketQueueManager = exports.guildLeaveQueue = exports.InMemoryCache = exports.TaskScheduler = exports.client = void 0;
require("@dotenvx/dotenvx");
const discord_js_1 = require("discord.js");
const commandHandler_1 = require("./handlers/commandHandler");
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
const logger_1 = __importDefault(require("./utils/logger"));
require("./instrument");
const await_reply_1 = require("./utils/tickets/await-reply");
const config_1 = __importDefault(require("./config"));
const worker_threads_1 = require("worker_threads");
const interactionCommandHandler_1 = require("./handlers/interactionCommandHandler");
const socket_io_client_1 = require("socket.io-client");
const shardId = parseInt(worker_threads_1.workerData["SHARDS"]);
const shardCount = parseInt(worker_threads_1.workerData["SHARD_COUNT"]);
const isProd = process.env["IS_PROD"] === "true";
exports.client = new discord_js_1.Client({
    shardCount,
    shards: [shardId],
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
const socket = (0, socket_io_client_1.io)(`${worker_threads_1.workerData["BRIDGE_URL"]}`, {
    auth: { token: worker_threads_1.workerData["BRIDGE_AUTH"] },
});
socket.on("connect", () => {
    socket.emit("identify", {
        ip: worker_threads_1.workerData["PUBLIC_IP"],
        port: worker_threads_1.workerData["PUBLIC_PORT"],
        noCluster: true,
    });
});
async function main() {
    await (0, commandHandler_1.loadPrefixCommands)();
    await (0, interactionCommandHandler_1.deployAppCommands)();
    await (0, eventHandler_1.loadEvents)(exports.client);
    await (0, connection_1.connectToMongooseDatabase)();
    if (!config_1.default.isWhiteLabel && isProd) {
        (0, metricsServer_1.startMetricsServer)(parseInt(worker_threads_1.workerData["METRICS_PORT"], 10));
        (0, apiServer_1.startApi)(parseInt(worker_threads_1.workerData["API_PORT"], 10));
    }
    await (0, interactionHandlers_1.loadInteractionHandlers)();
    await (0, lang_1.loadLanguages)();
    socket.emit("shardReady", shardId);
    socket.on("loginShard", (shard) => {
        if (shardId === shard) {
            exports.client.login(process.env["DISCORD_TOKEN"]);
        }
    });
    socket.on("logoutShard", (shard) => {
        if (shardId === shard) {
            logger_1.default.info(`Destroying client on ${shard}`);
            exports.client.destroy();
        }
    });
}
main();
process.on("unhandledRejection", (err) => logger_1.default.error("Unhandled Rejection", err));
process.on("uncaughtException", (err) => logger_1.default.error("Uncaught Exception", err));
//# sourceMappingURL=/src/index.js.map