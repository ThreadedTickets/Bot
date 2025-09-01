"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="83582256-5531-5999-99f3-c76e2b932f4e")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCommandPermissions = void 0;
const config_1 = __importDefault(require("../../config"));
const permissions_1 = require("../../constants/permissions");
const checkCommandPermissions = (command, userId) => {
    if (!command.permissionLevel)
        return true;
    if (command.permissionLevel === permissions_1.CommandPermission.Owner &&
        userId === config_1.default.owner)
        return true;
    if (command.permissionLevel === permissions_1.CommandPermission.Admin &&
        config_1.default.admins.includes(userId))
        return true;
    return false;
};
exports.checkCommandPermissions = checkCommandPermissions;
//# sourceMappingURL=/src/utils/commands/permissions.js.map
//# debugId=83582256-5531-5999-99f3-c76e2b932f4e
