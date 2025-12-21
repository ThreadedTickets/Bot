"use strict";
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
//# sourceMappingURL=/src/commands/prefix/developer/error.js.map