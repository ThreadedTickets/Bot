"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="bb65a9e2-a02c-57dd-83f5-e7b18884d1e5")}catch(e){}}();

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
//# debugId=bb65a9e2-a02c-57dd-83f5-e7b18884d1e5
