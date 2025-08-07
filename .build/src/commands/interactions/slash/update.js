"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="1c35277b-e898-55b3-8360-58278363cf55")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const viewAnnouncement_1 = require("../../../utils/bot/viewAnnouncement");
const lang_1 = require("../../../lang");
const getServer_1 = require("../../../utils/bot/getServer");
const command = {
    type: "slash",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("update")
        .setDescription("Get the latest update from the developers")
        .setNameLocalizations({})
        .setDescriptionLocalizations({}),
    async execute(client, data, interaction) {
        const announcement = await (0, viewAnnouncement_1.getAnnouncement)();
        if (!announcement)
            return interaction.reply({
                flags: [discord_js_1.MessageFlags.Ephemeral],
                content: (0, lang_1.t)(interaction.guildId
                    ? await (0, getServer_1.getServerLocale)(interaction.guildId)
                    : "en", "NO_ANNOUNCEMENT"),
            });
        interaction.reply({
            flags: [discord_js_1.MessageFlags.Ephemeral],
            ...JSON.parse(announcement),
        });
    },
};
exports.default = command;
//# sourceMappingURL=update.js.map
//# debugId=1c35277b-e898-55b3-8360-58278363cf55
