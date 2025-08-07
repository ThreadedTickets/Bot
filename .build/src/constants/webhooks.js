"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b737c719-52f6-5223-a50e-bdd018ea8777")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookUrls = exports.WebhookTypes = void 0;
var WebhookTypes;
(function (WebhookTypes) {
    /**
     * For posting errors to Discord
     */
    WebhookTypes[WebhookTypes["ErrorLog"] = 0] = "ErrorLog";
    /**
     * For posting when someone votes for Threaded
     */
    WebhookTypes[WebhookTypes["VoteLog"] = 1] = "VoteLog";
    WebhookTypes[WebhookTypes["BlacklistLog"] = 2] = "BlacklistLog";
})(WebhookTypes || (exports.WebhookTypes = WebhookTypes = {}));
exports.webhookUrls = {
    [WebhookTypes.ErrorLog]: process.env["LOGGING_DISCORD_WEBHOOK_ERRORS"],
    [WebhookTypes.VoteLog]: process.env["LOGGING_DISCORD_WEBHOOK_VOTES"],
    [WebhookTypes.BlacklistLog]: process.env["LOGGING_DISCORD_WEBHOOK_BLACKLISTS"],
};
//# sourceMappingURL=webhooks.js.map
//# debugId=b737c719-52f6-5223-a50e-bdd018ea8777
