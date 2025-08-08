"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="f05e8930-bec6-5c13-8442-1168ef4e9aab")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Guild_1 = require("../database/modals/Guild");
const logger_1 = __importDefault(require("../utils/logger"));
const event = {
    name: "guildDelete",
    async execute(client, data, guild) {
        logger_1.default.debug(`Removed from server ${guild.name} - set it to inactive`);
        await Guild_1.GuildSchema.findOneAndUpdate({ _id: guild.id }, { active: false });
    },
};
exports.default = event;
//# sourceMappingURL=/src/events/botRemoved.js.map
//# debugId=f05e8930-bec6-5c13-8442-1168ef4e9aab
