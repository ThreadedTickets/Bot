import "@dotenvx/dotenvx";
import { Client, GatewayIntentBits, Options, Partials } from "discord.js";
import { loadEvents } from "./handlers/eventHandler";
import { connectToMongooseDatabase } from "./database/connection";
import "./utils/hooks/register";
import { startApi } from "./apiServer";
import { InMemoryCache as MemCache } from "./utils/database/InMemoryCache";
import PQueue from "p-queue";
import { TaskScheduler as Scheduler } from "./utils/Scheduler";
import { closeTicket } from "./utils/tickets/close";
import { Locale } from "./types/Locale";
import { AsyncQueueManager } from "./utils/bot/QueueManager";
import { ClusterClient, getInfo } from "discord-hybrid-sharding";
import logger from "./utils/logger";
import "./instrument";
import { awaitReply } from "./utils/tickets/await-reply";
import config from "./config";

const isProd = process.env["IS_PROD"] === "true";

const shardList = isProd ? getInfo().SHARD_LIST : [0];
const totalShards = isProd ? getInfo().TOTAL_SHARDS : 1;

const discordClient = new Client({
  shards: shardList,
  shardCount: totalShards,

  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
  makeCache: Options.cacheWithLimits({
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
    ...Options.DefaultSweeperSettings,
    messages: {
      interval: 3_600, // Every hour.
      lifetime: 1_800, // Remove messages older than 30 minutes.
    },
    users: {
      interval: 3_600,
      filter: () => (user) => user.id !== process.env["DISCORD_CLIENT_ID"], // Remove all bots.
    },
    threadMembers: {
      interval: 3_600,
      filter: () => (user) => user.id !== process.env["DISCORD_CLIENT_ID"],
    },
    threads: {
      interval: 3_600,
      lifetime: 1_800,
    },
  },
});

// @ts-ignore
if (isProd) discordClient.cluster = new ClusterClient(discordClient);

// @ts-ignore
export const client = isProd ? clusterClient.client : discordClient;

connectToMongooseDatabase();
loadEvents(client);
if (!config.isWhiteLabel && isProd) {
  // The metrics server is not currently used
  //startMetricsServer(parseInt(process.env["METRICS_PORT"], 10));
  startApi(parseInt(process.env["API_PORT"], 10));
}
export const TaskScheduler = new Scheduler();
TaskScheduler.registerTaskFunction(
  "closeTicket",
  (params: { ticketId: string; locale: Locale; reason: string }) => {
    closeTicket(params.ticketId, params.locale, params.reason);
  }
);
TaskScheduler.registerTaskFunction(
  "awaitingReply",
  (params: {
    ticketId: string;
    action: "nothing" | "lock" | "close";
    notify: string | null;
    serverId: string;
  }) => {
    awaitReply(params.serverId, params.ticketId, params.action, params.notify);
  }
);
TaskScheduler.loadAndProcessBacklog(1000);
export const InMemoryCache = new MemCache({
  defaultTTL: 1000 * 10 * 60, // 10 minutes
  cleanupInterval: 1000 * 10, // 10 seconds
  groupLimits: {
    "responders:": 100,
  },
});
export const guildLeaveQueue = new PQueue({
  concurrency: 1,
  interval: 5000, // 1 second window
  intervalCap: 1, // 1 task per second
});
export const ticketQueueManager = new AsyncQueueManager();
export const massCloseManager = new AsyncQueueManager();

export const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

client.login(process.env["DISCORD_TOKEN"]);

process.on("unhandledRejection", (err: Error) =>
  logger.error("Unhandled Rejection", err)
);
process.on("uncaughtException", (err: Error) =>
  logger.error("Uncaught Exception", err)
);
