"use strict";
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
        await Guild_1.GuildSchema.findOneAndUpdate({ _id: guild.id }, { $set: {
                active: false,
                settings: {
                    logging: {
                        general: { enabled: true, channel: null, webhook: null },
                        tickets: {
                            type: {
                                feedback: { enabled: true, channel: null, webhook: null },
                                open: { enabled: true, channel: null, webhook: null },
                                close: { enabled: true, channel: null, webhook: null },
                                lock: { enabled: true, channel: null, webhook: null },
                                unlock: { enabled: true, channel: null, webhook: null },
                                raise: { enabled: true, channel: null, webhook: null },
                                lower: { enabled: true, channel: null, webhook: null },
                                move: { enabled: true, channel: null, webhook: null },
                                transcripts: { enabled: true, channel: null, webhook: null },
                            },
                        },
                        applications: {
                            type: {
                                create: { enabled: true, channel: null, webhook: null },
                                approve: { enabled: true, channel: null, webhook: null },
                                reject: { enabled: true, channel: null, webhook: null },
                                delete: { enabled: true, channel: null, webhook: null },
                            },
                        },
                    },
                },
            }
        });
        logger_1.default.debug(`Removed from server ${guild.name} - set it to inactive`);
        await Guild_1.GuildSchema.findOneAndUpdate({ _id: guild.id }, { active: false });
        if (!config_1.default.isWhiteLabel && guild.id)
            await redis_1.default.decr("guilds");
    },
};
exports.default = event;
//# sourceMappingURL=/src/events/botRemoved.js.map