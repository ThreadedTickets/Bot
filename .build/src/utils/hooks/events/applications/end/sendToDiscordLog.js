"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="c7ec0b97-50bf-55b4-8b72-6b078f22b870")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../..");
const getServer_1 = require("../../../../bot/getServer");
const sendLogToWebhook_1 = require("../../../../bot/sendLogToWebhook");
const colours_1 = __importDefault(require("../../../../../constants/colours"));
const lang_1 = require("../../../../../lang");
(0, __1.registerHook)("ApplicationEnd", async ({ client, application, responses, owner, }) => {
    const server = await (0, getServer_1.getServer)(application.server);
    const logChannel = (0, sendLogToWebhook_1.getAvailableLogChannel)(server.settings.logging, "applications.create");
    if (!logChannel)
        return;
    await (0, sendLogToWebhook_1.postLogToWebhook)(client, {
        channel: logChannel.channel,
        enabled: logChannel.enabled,
        webhook: logChannel.webhook,
    }, {
        embeds: [
            {
                color: parseInt(colours_1.default.info, 16),
                title: (0, lang_1.t)(server.preferredLanguage, "NEW_APPLICATION_LOG_TITLE"),
                description: (0, lang_1.t)(server.preferredLanguage, `NEW_APPLICATION_LOG_BODY`, {
                    user: `<@${owner}>`,
                    application: application.name,
                }),
            },
        ],
    });
});
//# sourceMappingURL=/src/utils/hooks/events/applications/end/sendToDiscordLog.js.map
//# debugId=c7ec0b97-50bf-55b4-8b72-6b078f22b870
