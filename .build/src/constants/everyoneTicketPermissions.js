"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="2995a392-2aa9-5fc0-b8ef-c4bd3a48d5fb")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
exports.default = {
    allow: [
        discord_js_1.PermissionFlagsBits.SendMessages,
        discord_js_1.PermissionFlagsBits.ReadMessageHistory,
    ],
    deny: [discord_js_1.PermissionFlagsBits.ViewChannel],
};
//# sourceMappingURL=/src/constants/everyoneTicketPermissions.js.map
//# debugId=2995a392-2aa9-5fc0-b8ef-c4bd3a48d5fb
