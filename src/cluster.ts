import "@dotenvx/dotenvx";
import {
  ClusterManager,
  HeartbeatManager,
  ReClusterManager,
} from "discord-hybrid-sharding";
import { Client } from "discord-cross-hosting";
import "./instrument";
import logger from "./utils/logger";
import { loadPrefixCommands } from "./handlers/commandHandler";
import { deployAppCommands } from "./handlers/interactionCommandHandler";
import { loadInteractionHandlers } from "./handlers/interactionHandlers";
import { loadLanguages } from "./lang";

const client = new Client({
  agent: "bot",
  host: process.env["BRIDGE_HOST"],
  port: parseInt(process.env["BRIDGE_PORT"]!),
  authToken: process.env["BRIDGE_AUTH"]!,
  rollingRestarts: true,
});
client.connect();

loadPrefixCommands();
deployAppCommands();
loadInteractionHandlers();
loadLanguages();

const manager = new ClusterManager(`${__dirname}/index.js`, {
  shardsPerClusters: parseInt(process.env["SHARDS_PER_CLUSTER"]!, 10),
  totalClusters: parseInt(process.env["TOTAL_CLUSTERS"]!, 10),
  mode: "process",
  token: process.env["DISCORD_TOKEN"],
});

manager.extend(
  new HeartbeatManager({
    interval: 1000 * 60 * 60 * 5,
    maxMissedHeartbeats: 5,
  })
);

manager.on("clusterCreate", (cluster) =>
  logger.info(
    `Launched Cluster ${cluster.id} with shards: ${cluster.shardList.join(
      ", "
    )}`
  )
);
client.listen(manager);

manager.extend(new ReClusterManager({}));
client
  .requestShardData()
  .then((e) => {
    if (!e) return;
    if (!e.shardList) return;
    manager.totalShards = e.totalShards;
    manager.totalClusters = e.shardList.length;
    manager.shardList = e.shardList;
    manager.clusterList = e.clusterList;
    manager.spawn({ timeout: -1 });
  })
  .catch((e) => logger.error("Cluster Error", e));
