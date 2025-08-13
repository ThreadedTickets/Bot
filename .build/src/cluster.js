"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@dotenvx/dotenvx");
const discord_hybrid_sharding_1 = require("discord-hybrid-sharding");
const discord_cross_hosting_1 = require("discord-cross-hosting");
require("./instrument");
const logger_1 = __importDefault(require("./utils/logger"));
const commandHandler_1 = require("./handlers/commandHandler");
const interactionCommandHandler_1 = require("./handlers/interactionCommandHandler");
const interactionHandlers_1 = require("./handlers/interactionHandlers");
const lang_1 = require("./lang");
const client = new discord_cross_hosting_1.Client({
    agent: "bot",
    host: process.env["BRIDGE_HOST"],
    port: parseInt(process.env["BRIDGE_PORT"]),
    authToken: process.env["BRIDGE_AUTH"],
    rollingRestarts: true,
});
client.connect();
(0, commandHandler_1.loadPrefixCommands)();
(0, interactionCommandHandler_1.deployAppCommands)();
(0, interactionHandlers_1.loadInteractionHandlers)();
(0, lang_1.loadLanguages)();
const manager = new discord_hybrid_sharding_1.ClusterManager(`${__dirname}/index.js`, {
    shardsPerClusters: parseInt(process.env["SHARDS_PER_CLUSTER"], 10),
    totalClusters: parseInt(process.env["TOTAL_CLUSTERS"], 10),
    mode: "process",
    token: process.env["DISCORD_TOKEN"],
});
manager.extend(new discord_hybrid_sharding_1.HeartbeatManager({
    interval: 1000 * 60 * 60 * 5,
    maxMissedHeartbeats: 5,
}));
manager.on("clusterCreate", (cluster) => logger_1.default.info(`Launched Cluster ${cluster.id} with shards: ${cluster.shardList.join(", ")}`));
client.listen(manager);
manager.extend(new discord_hybrid_sharding_1.ReClusterManager({}));
client
    .requestShardData()
    .then((e) => {
    if (!e)
        return;
    if (!e.shardList)
        return;
    manager.totalShards = e.totalShards;
    manager.totalClusters = e.shardList.length;
    manager.shardList = e.shardList;
    manager.clusterList = e.clusterList;
    manager.spawn({ timeout: -1 });
})
    .catch((e) => logger_1.default.error("Cluster Error", e));
//# sourceMappingURL=/src/cluster.js.map