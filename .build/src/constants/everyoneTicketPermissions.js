"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="fa5dea3e-1683-5fa9-b768-21f7575c94c0")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
exports.default = {
    allow: [
        discord_js_1.PermissionFlagsBits.SendMessages,
        discord_js_1.PermissionFlagsBits.ReadMessageHistory,
    ],
    deny: [discord_js_1.PermissionFlagsBits.ViewChannel],
};
//# sourceMappingURL=everyoneTicketPermissions.js.map
//# debugId=fa5dea3e-1683-5fa9-b768-21f7575c94c0
