"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="57a01c22-e485-58e4-b92c-12b429cc773d")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Guild_1 = require("../database/modals/Guild");
const logger_1 = __importDefault(require("../utils/logger"));
const event = {
    name: "guildCreate",
    async execute(client, data, guild) {
        logger_1.default.debug(`Added to server ${guild.name} - set it to active if it already exists`);
        await Guild_1.GuildSchema.findOneAndUpdate({ _id: guild.id }, { active: true });
    },
};
exports.default = event;
//# sourceMappingURL=botAdded.js.map
//# debugId=57a01c22-e485-58e4-b92c-12b429cc773d
