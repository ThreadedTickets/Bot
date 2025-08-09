import statPoster from "../statPoster";
import setBotStatusFromEnv from "../status";
import { Event } from "../types/Event";
import logger from "../utils/logger";

const event: Event<"ready"> = {
  name: "ready",
  execute(client) {
    logger.info(`${client.user?.username} is running`);
    setBotStatusFromEnv(client);
    if (process.env["IS_PROD"] === "true") statPoster(client);
  },
};

export default event;
