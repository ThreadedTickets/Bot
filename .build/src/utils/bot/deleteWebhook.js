"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="c2f57a9e-9cd6-5af7-9bab-e0445c548a07")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWebhookByUrl = deleteWebhookByUrl;
const discord_js_1 = require("discord.js");
const logger_1 = __importDefault(require("../logger"));
async function deleteWebhookByUrl(webhookUrl) {
    try {
        // Extract ID and token from the URL
        const match = webhookUrl.match(/\/webhooks\/(\d+)\/([\w-]+)/);
        if (!match)
            throw new Error("Invalid webhook URL format");
        const [, id, token] = match;
        const webhook = new discord_js_1.WebhookClient({ id, token });
        await webhook.delete();
        logger_1.default.debug(`Deleted logging webhook ${id}`);
    }
    catch (error) {
        logger_1.default.error(`Failed to delete logging webhook ${webhookUrl}`, error);
    }
}
//# sourceMappingURL=/src/utils/bot/deleteWebhook.js.map
//# debugId=c2f57a9e-9cd6-5af7-9bab-e0445c548a07
