"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="9633b6f5-ee86-5c6a-9c78-02f2e93b0296")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../../index");
const colours_1 = __importDefault(require("../../../../constants/colours"));
const lang_1 = require("../../../../lang");
const serverMessageToDiscordMessage_1 = __importDefault(require("../../../formatters/serverMessageToDiscordMessage"));
const getServer_1 = require("../../../bot/getServer");
const resolvePlaceholders_1 = require("../../../message/placeholders/resolvePlaceholders");
const generateBaseContext_1 = require("../../../message/placeholders/generateBaseContext");
(0, index_1.registerHook)("ApplicationStart", async ({ application, user, lang, server, }) => {
    let startConfirmationMessage = null;
    if (application.confirmationMessage) {
        const customConfirmationMessage = await (0, getServer_1.getServerMessage)(application.confirmationMessage, server.id);
        if (customConfirmationMessage)
            startConfirmationMessage = (0, serverMessageToDiscordMessage_1.default)(customConfirmationMessage);
    }
    if (!startConfirmationMessage)
        startConfirmationMessage = {
            embeds: [
                {
                    color: parseInt(colours_1.default.primary, 16),
                    description: (0, lang_1.t)(lang, "APPLICATION_DEFAULT_MESSAGE_CONFIRMATION"),
                },
            ],
        };
    user.send({
        ...(0, resolvePlaceholders_1.resolveDiscordMessagePlaceholders)(startConfirmationMessage, {
            ...(0, generateBaseContext_1.generateBasePlaceholderContext)({ server, user: user }),
            applicationName: application.name,
        }),
        components: [
            new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId(`startApp:${application._id}:${server.id}`)
                .setLabel("Start")
                .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
                .setCustomId(`cancelApp:${application._id}:${server.id}`)
                .setLabel("Cancel")
                .setStyle(discord_js_1.ButtonStyle.Danger)),
        ],
    });
});
//# sourceMappingURL=confirmDM.js.map
//# debugId=9633b6f5-ee86-5c6a-9c78-02f2e93b0296
