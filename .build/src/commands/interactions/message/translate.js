"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="f348bc99-1da5-5fe8-99d5-12e7cdc18895")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lang_1 = require("../../../lang");
const google_translate_api_x_1 = __importDefault(require("google-translate-api-x"));
const colours_1 = __importDefault(require("../../../constants/colours"));
const onError_1 = require("../../../utils/onError");
const command = {
    type: "message",
    testGuild: false,
    data: new discord_js_1.ContextMenuCommandBuilder()
        .setName("Translate Message")
        .setNameLocalizations({})
        .setType(discord_js_1.ApplicationCommandType.Message)
        .setContexts(discord_js_1.InteractionContextType.Guild),
    execute: async (client, data, interaction) => {
        if (!interaction.guildId)
            return; // We already know this as the command can only be run in guilds but this just shuts ts up
        const lang = data.lang;
        if (!interaction.targetMessage.content)
            return interaction.reply((await (0, onError_1.onError)(new Error("No content"))).discordMsg);
        interaction.reply({
            flags: [discord_js_1.MessageFlags.Ephemeral],
            embeds: [
                {
                    title: (0, lang_1.t)(lang, "COMMANDS_TRANSLATE_MESSAGE_TRANSLATED"),
                    color: parseInt(colours_1.default.success, 16),
                    description: `\`\`\`\n${(await (0, google_translate_api_x_1.default)(interaction.targetMessage.content, {
                        to: lang,
                    })).text}\n\`\`\``,
                },
            ],
        });
    },
};
exports.default = command;
//# sourceMappingURL=translate.js.map
//# debugId=f348bc99-1da5-5fe8-99d5-12e7cdc18895
