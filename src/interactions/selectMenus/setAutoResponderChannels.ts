import { GuildSchema } from "../../database/modals/Guild";
import { SelectMenuHandler } from "../../types/Interactions";
import { updateServerCache } from "../../utils/bot/updateServerCache";

const select: SelectMenuHandler = {
  customId: "autoResponderChannels",
  async execute(client, data, interaction) {
    interaction.deferUpdate();
    if (!interaction.guildId) return;
    const server = await GuildSchema.findOneAndUpdate(
      { _id: interaction.guildId },
      { "settings.autoResponders.extraAllowedChannels": interaction.values },
      { new: true, upsert: true }
    );
    updateServerCache(interaction.guildId, server);
  },
};

export default select;
