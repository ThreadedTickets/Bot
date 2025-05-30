import "dotenv/config";
import { ClusterManager, HeartbeatManager } from "discord-hybrid-sharding";
import { logger } from "./utils/logger";
import { Client } from "discord-cross-hosting";

const client = new Client({
  agent: "bot",
  host: process.env["BRIDGE_HOST"],
  port: parseInt(process.env["BRIDGE_PORT"]!),
  authToken: process.env["BRIDGE_AUTH"]!,
  rollingRestarts: false,
});
client.connect();

const manager = new ClusterManager(`${__dirname}/index.js`, {
  totalShards: "auto", // or 'auto'
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
  logger(
    "Clusters",
    "Info",
    `Launched Cluster ${cluster.id} with shards: ${cluster.shardList.join(
      ", "
    )}`
  )
);
client.listen(manager);
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
  .catch((e) => logger("Clusters", "Error", e));
