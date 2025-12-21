"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Guild_1 = require("../../database/modals/Guild");
const updateServerCache_1 = require("../../utils/bot/updateServerCache");
const select = {
    customId: "autoResponderChannels",
    async execute(client, data, interaction) {
        interaction.deferUpdate();
        if (!interaction.guildId)
            return;
        const server = await Guild_1.GuildSchema.findOneAndUpdate({ _id: interaction.guildId }, { "settings.autoResponders.extraAllowedChannels": interaction.values }, { new: true, upsert: true });
        (0, updateServerCache_1.updateServerCache)(interaction.guildId, server);
    },
};
exports.default = select;
//# sourceMappingURL=/src/interactions/selectMenus/setAutoResponderChannels.js.map