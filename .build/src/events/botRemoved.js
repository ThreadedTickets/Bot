"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="a04dac12-2728-544a-9b3c-808a6f52cdc6")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
const Guild_1 = require("../database/modals/Guild");
const logger_1 = __importDefault(require("../utils/logger"));
const redis_1 = __importDefault(require("../utils/redis"));
const event = {
    name: "guildDelete",
    async execute(client, data, guild) {
        logger_1.default.debug(`Removed from server ${guild.name} - set it to inactive`);
        await Guild_1.GuildSchema.findOneAndUpdate({ _id: guild.id }, { active: false });
        if (!config_1.default.isWhiteLabel && guild.id)
            await redis_1.default.decr("guilds");
    },
};
exports.default = event;
//# sourceMappingURL=/src/events/botRemoved.js.map
//# debugId=a04dac12-2728-544a-9b3c-808a6f52cdc6
