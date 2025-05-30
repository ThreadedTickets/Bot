import { Client, GatewayIntentBits, Partials, REST, Routes } from "discord.js";
import {
  loadPrefixCommands,
  handlePrefixMessage,
} from "./handlers/commandHandler";
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

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

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

process.on("unhandledRejection", (err: Error) =>
  onError("System", `${err.message}`, { stack: err.stack })
);
process.on("uncaughtException", (err: Error) =>
  onError("System", `${err.message}`, { stack: err.stack })
);
