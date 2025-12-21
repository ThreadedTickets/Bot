"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../..");
const permissions_1 = require("../../../constants/permissions");
const cmd = {
    name: "services",
    usage: "services",
    permissionLevel: permissions_1.CommandPermission.Owner,
    async execute(client, data, message, args) {
        message.reply(`Transcript Service\n` +
            `> Status: ${__1.transcriptService.status}\n` +
            `> Last ping: ${__1.transcriptService.lastPing ? `<t:${Math.round(__1.transcriptService.lastPing.getTime() / 1000)}:R>` : "Never"}`);
    },
};
exports.default = cmd;
//# sourceMappingURL=/src/commands/prefix/developer/services.js.map