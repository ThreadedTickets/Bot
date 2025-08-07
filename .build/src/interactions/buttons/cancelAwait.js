"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="00e08de9-e64d-51a6-beb8-1103631e4825")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const __1 = require("../..");
const lang_1 = require("../../lang");
const logger_1 = __importDefault(require("../../utils/logger"));
const button = {
    customId: "cancelAwait",
    async execute(client, data, interaction) {
        const tId = interaction.customId.split(":")[1];
        if (!(await __1.TaskScheduler.taskExists(`AWAIT-${tId}`)))
            return interaction.reply({
                content: (0, lang_1.t)(data.lang, "TICKET_NOT_AWAITING"),
                flags: [discord_js_1.MessageFlags.Ephemeral],
            });
        __1.TaskScheduler.removeTask(`AWAIT-${tId}`);
        interaction.reply({
            content: (0, lang_1.t)(data.lang, "TICKET_AWAIT_CANCEL", {
                user: interaction.user.id,
            }),
            flags: [discord_js_1.MessageFlags.Ephemeral],
        });
        interaction.channel.send({
            content: (0, lang_1.t)(data.lang, "TICKET_AWAIT_CANCEL", {
                user: interaction.user.id,
            }),
            allowedMentions: {},
        });
        logger_1.default.debug(`Canceled await-reply task on ticket ${tId}`);
    },
};
exports.default = button;
//# sourceMappingURL=cancelAwait.js.map
//# debugId=00e08de9-e64d-51a6-beb8-1103631e4825
