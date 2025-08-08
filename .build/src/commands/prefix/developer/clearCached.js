"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = require("../../../constants/permissions");
const invalidateCache_1 = require("../../../utils/database/invalidateCache");
const command = {
    name: "clearcache",
    aliases: ["cc"],
    permissionLevel: permissions_1.CommandPermission.Admin,
    usage: "<key<string>>",
    async execute(client, data, message, args) {
        await (0, invalidateCache_1.invalidateCache)(args.key);
        await message.react("✅");
    },
};
exports.default = command;
//# sourceMappingURL=/src/commands/prefix/developer/clearCached.js.map