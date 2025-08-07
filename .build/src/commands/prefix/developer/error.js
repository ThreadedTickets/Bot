"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="40e2f386-3c0c-5fde-b312-df092da439b8")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = require("../../../constants/permissions");
const Error_1 = require("../../../database/modals/Error");
const getCachedElse_1 = require("../../../utils/database/getCachedElse");
const toTimeUnit_1 = require("../../../utils/formatters/toTimeUnit");
const cmd = {
    name: "error",
    usage: "<error_id>",
    aliases: ["e", "err"],
    permissionLevel: permissions_1.CommandPermission.Admin,
    async execute(client, data, message, args) {
        const fetch = await (0, getCachedElse_1.getCachedDataElse)(`errors:${args.error_id}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 10, 0, 0), async () => {
            return await Error_1.ErrorSchema.findById(args.error_id).catch((err) => {
                return null;
            });
        });
        message.reply({ content: JSON.stringify(fetch.data, null, 2) });
    },
};
exports.default = cmd;
//# sourceMappingURL=error.js.map
//# debugId=40e2f386-3c0c-5fde-b312-df092da439b8
