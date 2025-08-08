"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="2249776c-cf3a-525c-a347-2f1fde6312fe")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const getServer_1 = require("../utils/bot/getServer");
const invalidateCache_1 = require("../utils/database/invalidateCache");
const close_1 = require("../utils/tickets/close");
const duration_1 = require("../utils/formatters/duration");
const logger_1 = __importDefault(require("../utils/logger"));
const event = {
    name: "guildMemberRemove",
    async execute(client, data, member) {
        const start = new Date().getTime();
        const user = member;
        await (0, invalidateCache_1.invalidateCache)(`tickets:${member.guild.id}:${user.id}:Locked|Open`);
        const userTickets = (await (0, getServer_1.getUserTickets)(member.guild.id, user.id, ["Open", "Locked"])).filter((t) => t.closeOnLeave);
        if (!userTickets.length)
            return;
        let failed = userTickets.length;
        __1.massCloseManager.wrap(async () => {
            for (const ticket of userTickets) {
                const a = await __1.massCloseManager.wrap(async () => {
                    await (0, close_1.closeTicket)(ticket._id, data?.lang ?? "en");
                    return true;
                });
                if (a)
                    failed--;
            }
        }, member.guild.id);
        logger_1.default.debug(`Finished mass close of ${userTickets.length} tickets in ${member.guild.name}. Took ${(0, duration_1.formatDuration)(new Date().getTime() - start)}`, { user: user.id });
    },
};
exports.default = event;
//# sourceMappingURL=/src/events/memberLeaveServer.js.map
//# debugId=2249776c-cf3a-525c-a347-2f1fde6312fe
