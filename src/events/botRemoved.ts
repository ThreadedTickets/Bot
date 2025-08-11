import config from "../config";
import { GuildSchema } from "../database/modals/Guild";
import { Event } from "../types/Event";
import logger from "../utils/logger";
import redis from "../utils/redis";

const event: Event<"guildDelete"> = {
  name: "guildDelete",
  async execute(client, data, guild) {
    logger.debug(`Removed from server ${guild.name} - set it to inactive`);
    await GuildSchema.findOneAndUpdate({ _id: guild.id }, { active: false });
    if (!config.isWhiteLabel) redis.decr("guilds");
  },
};

export default event;
