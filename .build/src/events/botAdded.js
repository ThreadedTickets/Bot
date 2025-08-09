"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="53fe0cfd-93ca-5164-952d-31db805ffe40")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
const Guild_1 = require("../database/modals/Guild");
const logger_1 = __importDefault(require("../utils/logger"));
const event = {
    name: "guildCreate",
    async execute(client, data, guild) {
        logger_1.default.debug(`Added to server ${guild.name} - set it to active if it already exists`);
        if (config_1.default.isWhiteLabel) {
            logger_1.default.warn("Whitelabel bot added to server, checking if this is ok");
            if (!config_1.default.whiteLabelServerIds.includes(guild.id)) {
                logger_1.default.warn("Bot not allowed in server, leaving");
                await guild
                    .leave()
                    .catch((err) => logger_1.default.warn(`Failed to leave unauthorized guild ${guild.id}`, err));
                return;
            }
        }
        await Guild_1.GuildSchema.findOneAndUpdate({ _id: guild.id }, { active: true });
    },
};
exports.default = event;
//# sourceMappingURL=/src/events/botAdded.js.map
//# debugId=53fe0cfd-93ca-5164-952d-31db805ffe40
