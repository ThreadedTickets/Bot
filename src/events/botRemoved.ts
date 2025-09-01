import config from "../config";
import { GuildSchema } from "../database/modals/Guild";
import { Event } from "../types/Event";
import logger from "../utils/logger";
import redis from "../utils/redis";

const event: Event<"guildDelete"> = {
  name: "guildDelete",
  async execute(client, data, guild) {
    logger(
      "System",
      "Info",
      `Removed from server ${guild.name} - set it to inactive`
    );
    await GuildSchema.findOneAndUpdate(
      { _id: guild.id },
      {
        active: false,
        settings: {
          logging: {
            general: { enabled: true, channel: null, webhook: null },
            tickets: {
              type: {
                feedback: { enabled: true, channel: null, webhook: null },
                open: { enabled: true, channel: null, webhook: null },
                close: { enabled: true, channel: null, webhook: null },
                lock: { enabled: true, channel: null, webhook: null },
                unlock: { enabled: true, channel: null, webhook: null },
                raise: { enabled: true, channel: null, webhook: null },
                lower: { enabled: true, channel: null, webhook: null },
                move: { enabled: true, channel: null, webhook: null },
                transcripts: { enabled: true, channel: null, webhook: null },
              },
            },
            applications: {
              type: {
                create: { enabled: true, channel: null, webhook: null },
                approve: { enabled: true, channel: null, webhook: null },
                reject: { enabled: true, channel: null, webhook: null },
                delete: { enabled: true, channel: null, webhook: null },
              },
            },
          },
        },
      }
    );
    logger.debug(`Removed from server ${guild.name} - set it to inactive`);
    await GuildSchema.findOneAndUpdate({ _id: guild.id }, { active: false });
    if (!config.isWhiteLabel && guild.id) await redis.decr("guilds");
  },
};

export default event;
