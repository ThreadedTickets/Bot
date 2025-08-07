"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="34111a74-47f4-5339-bef2-bfae14b1bc66")}catch(e){}}();

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
//# sourceMappingURL=setAutoResponderChannels.js.map
//# debugId=34111a74-47f4-5339-bef2-bfae14b1bc66
