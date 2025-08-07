"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="8b54f726-1eae-52e0-bc8d-10576cc7bc9f")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onError = void 0;
const Error_1 = require("../database/modals/Error");
const colours_1 = __importDefault(require("../constants/colours"));
const webhookPoster_1 = require("./message/webhookPoster");
const webhooks_1 = require("../constants/webhooks");
const metricsServer_1 = require("../metricsServer");
const lang_1 = require("../lang");
const logger_1 = __importDefault(require("./logger"));
const formatDiscordMessage = (id, content, context, locale) => {
    const message = {
        flags: [64],
        content: "",
        components: [],
        embeds: [
            {
                color: parseInt(colours_1.default.error, 16),
                title: (0, lang_1.t)(locale || "en", "ERROR_TITLE"),
                description: (0, lang_1.t)(locale || "en", "ERROR_DESCRIPTION", {
                    error_message: content,
                    support_server: `[support server](${process.env.DISCORD_SUPPORT_INVITE})`,
                    error_code: id,
                }),
            },
        ],
    };
    return message;
};
const onError = async (error, context, locale) => {
    const errorDocument = await Error_1.ErrorSchema.create({
        content: error.message,
        context,
    });
    if (typeof error === "string")
        error = new Error(error);
    const id = errorDocument._id.toString();
    logger_1.default.error(`Error ${id}`, error);
    metricsServer_1.errors.inc({ error: error.message });
    (0, webhookPoster_1.postToWebhook)(webhooks_1.WebhookTypes.ErrorLog, {
        username: id,
        embeds: [
            {
                color: parseInt(colours_1.default.error, 16),
                title: `Error ${id}`,
                description: `${error.message}\n\`\`\`\n${context ? JSON.stringify(context, null, 2) : "No context"}\n\`\`\``,
            },
        ],
    });
    return {
        /**
         * A message formatted so that it can be posted to Discord
         */
        discordMsg: formatDiscordMessage(id, error.message, context, locale),
    };
};
exports.onError = onError;
//# sourceMappingURL=onError.js.map
//# debugId=8b54f726-1eae-52e0-bc8d-10576cc7bc9f
