"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="5f1b1c3c-2986-5ce9-893c-88be6107b685")}catch(e){}}();

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
//# sourceMappingURL=botRemoved.js.map
//# debugId=5f1b1c3c-2986-5ce9-893c-88be6107b685
