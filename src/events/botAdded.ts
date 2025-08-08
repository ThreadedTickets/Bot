import config from "../config";
import { GuildSchema } from "../database/modals/Guild";
import { Event } from "../types/Event";
import logger from "../utils/logger";

const event: Event<"guildCreate"> = {
  name: "guildCreate",
  async execute(client, data, guild) {
    logger.debug(
      `Added to server ${guild.name} - set it to active if it already exists`
    );
    if (config.isWhiteLabel) {
      logger.warn("Whitelabel bot added to server, checking if this is ok");
      if (!config.whiteLabelServerIds.includes(guild.id)) {
        logger.warn("Bot not allowed in server, leaving");
        await guild
          .leave()
          .catch((err) =>
            logger.warn(`Failed to leave unauthorized guild ${guild.id}`, err)
          );
        return;
      }
    }
    await GuildSchema.findOneAndUpdate({ _id: guild.id }, { active: true });
  },
};

export default event;
