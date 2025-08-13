import { workerData } from "worker_threads";
import { TaskScheduler } from "..";
import { socket } from "../cluster";
import statPoster from "../statPoster";
import setBotStatusFromEnv from "../status";
import { Event } from "../types/Event";
import logger from "../utils/logger";

const event: Event<"ready"> = {
  name: "ready",
  async execute(a, b, client) {
    logger.info(`${client.user?.username} is running`);
    setBotStatusFromEnv(client);
    TaskScheduler.loadAndProcessBacklog(1000);
    if (process.env["IS_PROD"] === "true") {
      statPoster(client);
    }
    (await socket).emit("shardRunning", workerData["SHARDS"]);
  },
};

export default event;
