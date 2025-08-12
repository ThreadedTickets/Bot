import "@dotenvx/dotenvx";
import "./instrument";
import { io, Socket } from "socket.io-client";
import { ShardingManager } from "discord.js";
import logger from "./utils/logger";
import redis from "./utils/redis";

let socketInstance: Socket;

export const socket: Promise<Socket> = (async () => {
  const guildCountStr = await redis.get("guilds");
  const guildCount = guildCountStr ? parseInt(guildCountStr) : 0;
  const totalShards = Math.max(1, Math.ceil(guildCount / 1000));

  logger.info(`Calculated total shards: ${totalShards}`);

  socketInstance = io(`${process.env["BRIDGE_URL"]}`, {
    auth: { token: process.env["BRIDGE_AUTH"] },
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: Infinity,
  });

  const manager = new ShardingManager("./.build/src/index.js", {
    token: process.env["DISCORD_TOKEN"],
    mode: "worker",
    respawn: true,
    totalShards,
  });

  return new Promise((resolve, reject) => {
    socketInstance.on("connect", () => {
      logger.info("Socket connected");

      socketInstance.emit("identify", {
        ip: process.env["PUBLIC_IP"],
        port: process.env["PUBLIC_PORT"],
      });

      resolve(socketInstance);
    });

    socketInstance.on("connect_error", (err) => {
      logger.error("Socket connection error:", err);
      reject(err);
    });

    socketInstance.on("readyUpShard", (shardId) => {
      logger.debug(`Spawning new shard: ${shardId}`);
      manager.createShard(shardId).spawn();
    });

    socketInstance.on("killShard", (shardId) => {
      const shard = manager.shards.get(shardId);

      if (shard) {
        shard.kill();
        logger.info(`Killed shard ${shardId}`);
        manager.shards.delete(shardId);
      }
    });

    manager.on("shardCreate", (shard) => {
      logger.info(`Spawned shard ${shard.id}`);

      shard.on("death", (proc) => {
        logger.warn(`Shard ${shard.id} died`);
      });
    });
  });
})();
