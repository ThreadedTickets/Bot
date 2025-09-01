"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="2a8d1c26-1fd9-5aaf-b4e2-56cc33c86430")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
exports.default = {
    allow: [
        discord_js_1.PermissionFlagsBits.ViewChannel,
        discord_js_1.PermissionFlagsBits.SendMessages,
        discord_js_1.PermissionFlagsBits.ReadMessageHistory,
    ],
    deny: [],
};
//# sourceMappingURL=/src/constants/ticketOwnerPermissions.js.map
//# debugId=2a8d1c26-1fd9-5aaf-b4e2-56cc33c86430
