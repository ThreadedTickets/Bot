"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b2ef65bb-f6af-5443-a4b1-ee89f4624760")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postToWebhook = void 0;
const axios_1 = __importDefault(require("axios"));
const webhooks_1 = require("../../constants/webhooks");
const logger_1 = __importDefault(require("../logger"));
const postToWebhook = async (type, content) => {
    const url = webhooks_1.webhookUrls[type];
    if (!url)
        throw new Error(`Webhook URL not configured for type: ${type}`);
    axios_1.default
        .post(url, content)
        .catch((err) => {
        return logger_1.default.error(`Couldn't post webhook ${type}`, err);
    })
        .finally(() => logger_1.default.debug(`Posted to webhook ${type}`));
};
exports.postToWebhook = postToWebhook;
//# sourceMappingURL=webhookPoster.js.map
//# debugId=b2ef65bb-f6af-5443-a4b1-ee89f4624760
