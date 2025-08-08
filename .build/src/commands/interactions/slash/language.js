"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="568babe4-dc24-5693-bc14-c0561b512c4e")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const getServer_1 = require("../../../utils/bot/getServer");
const lang_1 = require("../../../lang");
const locales_1 = require("../../../constants/locales");
const localeMap = locales_1.supportedLocales;
const languages = Object.keys(localeMap).map((k) => ({
    name: `${localeMap[k].emoji} ${localeMap[k].name}`,
    value: k,
}));
const command = {
    type: "slash",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("language")
        .setDescription("Set the preferred language for your server")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .addStringOption((opt) => opt
        .setName("value")
        .setDescription("Chose a supported language")
        .setRequired(true)
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .addChoices(languages)),
    async execute(client, data, interaction) {
        if (!interaction.guildId)
            return;
        const newLanguage = interaction.options.getString("value", true);
        (0, getServer_1.setServerLocale)(interaction.guildId, newLanguage);
        interaction.reply({
            flags: [discord_js_1.MessageFlags.Ephemeral],
            content: (0, lang_1.t)(newLanguage, "LANGUAGE_UPDATED", {
                new_language: localeMap[newLanguage].name,
            }),
        });
    },
};
exports.default = command;
//# sourceMappingURL=/src/commands/interactions/slash/language.js.map
//# debugId=568babe4-dc24-5693-bc14-c0561b512c4e
