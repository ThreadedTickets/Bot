"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socket = void 0;
require("@dotenvx/dotenvx");
require("./instrument");
const socket_io_client_1 = require("socket.io-client");
const discord_js_1 = require("discord.js");
const logger_1 = __importDefault(require("./utils/logger"));
const redis_1 = __importDefault(require("./utils/redis"));
let socketInstance;
exports.socket = (async () => {
    const guildCountStr = await redis_1.default.get("guilds");
    const guildCount = guildCountStr ? parseInt(guildCountStr) : 0;
    const totalShards = Math.max(1, Math.ceil(guildCount / 1000));
    logger_1.default.info(`Calculated total shards: ${totalShards}`);
    socketInstance = (0, socket_io_client_1.io)(`${process.env["BRIDGE_URL"]}`, {
        auth: { token: process.env["BRIDGE_AUTH"] },
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: Infinity,
    });
    const manager = new discord_js_1.ShardingManager("./.build/src/index.js", {
        token: process.env["DISCORD_TOKEN"],
        mode: "worker",
        respawn: true,
        totalShards,
    });
    return new Promise((resolve, reject) => {
        socketInstance.on("connect", () => {
            logger_1.default.info("Socket connected");
            socketInstance.emit("identify", {
                ip: process.env["PUBLIC_IP"],
                port: process.env["PUBLIC_PORT"],
            });
            resolve(socketInstance);
        });
        socketInstance.on("connect_error", (err) => {
            logger_1.default.error("Socket connection error:", err);
            reject(err);
        });
        socketInstance.on("readyUpShard", (shardId) => {
            logger_1.default.debug(`Spawning new shard: ${shardId}`);
            manager.createShard(shardId).spawn();
        });
        socketInstance.on("killShard", (shardId) => {
            const shard = manager.shards.get(shardId);
            if (shard) {
                shard.kill();
                logger_1.default.info(`Killed shard ${shardId}`);
                manager.shards.delete(shardId);
            }
        });
        manager.on("shardCreate", (shard) => {
            logger_1.default.info(`Spawned shard ${shard.id}`);
            shard.on("death", (proc) => {
                logger_1.default.warn(`Shard ${shard.id} died`);
            });
        });
    });
})();
//# sourceMappingURL=/src/cluster.js.map