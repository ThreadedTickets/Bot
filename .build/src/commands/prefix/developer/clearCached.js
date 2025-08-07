"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="499ba4c8-e89f-536b-aa41-88812c588711")}catch(e){}}();

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
//# sourceMappingURL=clearCached.js.map
//# debugId=499ba4c8-e89f-536b-aa41-88812c588711
