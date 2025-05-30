import { Event } from "../types/Event";
import { logger } from "../utils/logger";

const event: Event<"ready"> = {
  name: "ready",
  execute(client) {
    logger("Startup", "Info", `${client.user?.username} is running`);
  },
};

export default event;
