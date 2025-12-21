"use strict";
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