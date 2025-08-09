"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="8e3e8013-3ac5-5923-95a0-97b3fe799245")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandPermission = exports.permissionLevels = exports.PermissionLevel = void 0;
const discord_js_1 = require("discord.js");
var PermissionLevel;
(function (PermissionLevel) {
    PermissionLevel[PermissionLevel["None"] = 0] = "None";
    PermissionLevel[PermissionLevel["Staff"] = 1] = "Staff";
    PermissionLevel[PermissionLevel["Admin"] = 2] = "Admin";
})(PermissionLevel || (exports.PermissionLevel = PermissionLevel = {}));
exports.permissionLevels = {
    [PermissionLevel.Admin]: [discord_js_1.PermissionFlagsBits.Administrator],
    [PermissionLevel.Staff]: [discord_js_1.PermissionFlagsBits.ManageMessages],
    [PermissionLevel.None]: [],
};
var CommandPermission;
(function (CommandPermission) {
    CommandPermission[CommandPermission["None"] = 0] = "None";
    CommandPermission[CommandPermission["Admin"] = 1] = "Admin";
    CommandPermission[CommandPermission["Owner"] = 2] = "Owner";
})(CommandPermission || (exports.CommandPermission = CommandPermission = {}));
//# sourceMappingURL=/src/constants/permissions.js.map
//# debugId=8e3e8013-3ac5-5923-95a0-97b3fe799245
