// import { ClusterClient, getInfo } from "discord-hybrid-sharding";
// import { Client, GatewayIntentBits, Options, Partials } from "discord.js";
// import { TaskScheduler } from "./utils/Scheduler";
// const isProd = process.env["IS_PROD"] === "true";

// const shardList = isProd ? getInfo().SHARD_LIST : [0];
// const totalShards = isProd ? getInfo().TOTAL_SHARDS : 1;

// export default class ThreadedClient extends Client {
//   public readonly isProduction = isProd;
//   public readonly cluster = isProd ? new ClusterClient(this) : null;
//   public scheduler = new TaskScheduler();

//   constructor() {
//     super({
//       shards: shardList,
//       shardCount: totalShards,

//       intents: [
//         GatewayIntentBits.Guilds,
//         GatewayIntentBits.GuildMessages,
//         GatewayIntentBits.MessageContent,
//         GatewayIntentBits.DirectMessages,
//         GatewayIntentBits.GuildMembers,
//       ],
//       partials: [Partials.Channel],
//       makeCache: Options.cacheWithLimits({
//         ApplicationCommandManager: 0,
//         ApplicationEmojiManager: 0,
//         AutoModerationRuleManager: 0,
//         BaseGuildEmojiManager: 0,
//         DMMessageManager: 3,
//         EntitlementManager: 0,
//         GuildBanManager: 0,
//         GuildEmojiManager: 0,
//         GuildForumThreadManager: 0,
//         GuildInviteManager: 0,
//         GuildMemberManager: 3,
//         GuildMessageManager: 3,
//         GuildScheduledEventManager: 0,
//         GuildStickerManager: 0,
//         GuildTextThreadManager: 3,
//         MessageManager: 3,
//         PresenceManager: 0,
//         ReactionManager: 0,
//         ReactionUserManager: 0,
//         StageInstanceManager: 0,
//         ThreadManager: 3,
//         ThreadMemberManager: 3,
//         UserManager: 0,
//         VoiceStateManager: 0,
//       }),
//       sweepers: {
//         ...Options.DefaultSweeperSettings,
//         messages: {
//           interval: 3_600, // Every hour.
//           lifetime: 1_800, // Remove messages older than 30 minutes.
//         },
//         users: {
//           interval: 3_600,
//           filter: () => (user) => user.id !== process.env["DISCORD_CLIENT_ID"], // Remove all bots.
//         },
//         threadMembers: {
//           interval: 3_600,
//           filter: () => (user) => user.id !== process.env["DISCORD_CLIENT_ID"],
//         },
//         threads: {
//           interval: 3_600,
//           lifetime: 1_800,
//         },
//       },
//     });
//   }

//   public startup() {
//     this.scheduler.registerTaskFunction();
//     this.login();
//   }

//   public shutdown() {
//     Task;
//   }
// }
