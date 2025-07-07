import "@dotenvx/dotenvx";
import { Client, GatewayIntentBits, Options, Partials } from "discord.js";
import { loadPrefixCommands } from "./handlers/commandHandler";
import { deployAppCommands } from "./handlers/interactionCommandHandler";
import { loadEvents } from "./handlers/eventHandler";
import { connectToMongooseDatabase } from "./database/connection";
import { startMetricsServer } from "./metricsServer";
import { loadInteractionHandlers } from "./handlers/interactionHandlers";
import { onError } from "./utils/onError";
import "./utils/hooks/register";
import { loadLanguages } from "./lang";
import { startApi } from "./apiServer";
import { InMemoryCache as MemCache } from "./utils/database/InMemoryCache";
import PQueue from "p-queue";
import { TaskScheduler as Scheduler } from "./utils/Scheduler";
import { logger } from "./utils/logger";
import { closeTicket } from "./utils/tickets/close";
import { Locale } from "./types/Locale";
import { AsyncQueueManager } from "./utils/bot/QueueManager";
import { ClusterClient, getInfo } from "discord-hybrid-sharding";
import * as Sentry from "@sentry/node";

const shardList = getInfo().SHARD_LIST;
const totalShards = getInfo().TOTAL_SHARDS;

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
export const clusterClient = new ClusterClient(discordClient);
export const client = clusterClient.client;

loadPrefixCommands();
deployAppCommands();
loadEvents(client);
connectToMongooseDatabase();
startMetricsServer(parseInt(process.env["METRICS_PORT"]!, 10));
startApi(parseInt(process.env["API_PORT"]!, 10));
loadInteractionHandlers();
loadLanguages();
export const TaskScheduler = new Scheduler((src, lvl, msg) =>
  logger(src, lvl, msg)
);
TaskScheduler.registerTaskFunction(
  "closeTicket",
  (params: { ticketId: string; locale: Locale }) => {
    closeTicket(params.ticketId, params.locale);
  }
);
export const InMemoryCache = new MemCache({
  defaultTTL: 1000 * 60 * 60, // an hour
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

process.on("unhandledRejection", (err: Error) => {
  onError("System", `${err.message}`, { stack: err.stack });
  Sentry.captureException(err);
});
process.on("uncaughtException", (err: Error) => {
  onError("System", `${err.message}`, { stack: err.stack });
  Sentry.captureException(err);
});
