import { GuildSchema } from "../database/modals/Guild";
import { Event } from "../types/Event";
import { logger } from "../utils/logger";

const event: Event<"guildDelete"> = {
  name: "guildDelete",
  async execute(client, data, guild) {
    logger(
      "System",
      "Info",
      `Removed from server ${guild.name} - set it to inactive`
    );
    await GuildSchema.findOneAndUpdate({ _id: guild.id }, { active: false });
  },
};

export default event;
