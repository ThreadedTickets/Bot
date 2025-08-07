import { GuildSchema } from "../database/modals/Guild";
import { Event } from "../types/Event";
import logger from "../utils/logger";

const event: Event<"guildCreate"> = {
  name: "guildCreate",
  async execute(client, data, guild) {
    logger.debug(
      `Added to server ${guild.name} - set it to active if it already exists`
    );
    await GuildSchema.findOneAndUpdate({ _id: guild.id }, { active: true });
  },
};

export default event;
