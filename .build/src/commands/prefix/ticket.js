"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="d30a831c-a2e0-578c-b8e5-1b35f03b941f")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const lang_1 = require("../../lang");
const getServer_1 = require("../../utils/bot/getServer");
const onError_1 = require("../../utils/onError");
const performChecks_1 = require("../../utils/tickets/performChecks");
const getGuildMember_1 = require("../../utils/bot/getGuildMember");
const hooks_1 = require("../../utils/hooks");
const cmd = {
    name: "ticket",
    usage: "<triggerId> [user]",
    async execute(client, data, message, args) {
        if (!message.guildId)
            return;
        if (!message.author.bot)
            return;
        const triggerId = args.triggerId;
        const user = message.mentions.users.first();
        if (!user)
            return message.reply((await (0, onError_1.onError)(new Error((0, lang_1.t)(data.lang, "ERROR_CODE_2013")))).discordMsg);
        const trigger = await (0, getServer_1.getServerTicketTrigger)(triggerId, message.guildId);
        if (!trigger)
            return message.reply((await (0, onError_1.onError)(new Error("Trigger not found"))).discordMsg);
        const member = await (0, getGuildMember_1.getGuildMember)(client, message.guildId, user.id);
        if (!member)
            return message.reply((await (0, onError_1.onError)(new Error((0, lang_1.t)(data.lang, "ERROR_CODE_2014")))).discordMsg);
        const triggerObject = trigger.toObject();
        const triggerTyped = {
            ...triggerObject,
        };
        const msg = await message.reply({
            content: (0, lang_1.t)(data.lang, "TICKET_CREATE_PERFORMING_CHECKS"),
        });
        const checks = await (0, performChecks_1.performTicketChecks)(triggerTyped, member);
        if (!checks.allowed) {
            return msg.edit((await (0, onError_1.onError)(new Error((0, lang_1.t)(data.lang, `ERROR_CODE_${checks.error}`))))
                .discordMsg);
        }
        const checkTargetChannel = await (0, performChecks_1.canCreateTicketTarget)(message.guild, trigger.isThread ? "thread" : "channel", trigger.openChannel);
        if (!checkTargetChannel.allowed)
            return msg.edit((await (0, onError_1.onError)(new Error((0, lang_1.t)(data.lang, `ERROR_CODE_${checkTargetChannel.error}`)))).discordMsg);
        await msg.edit({
            content: (0, lang_1.t)(data.lang, "TICKET_CREATE_CHECKS_PASSED"),
        });
        (0, hooks_1.runHooks)("TicketCreate", {
            client: client,
            guild: message.guild,
            lang: data.lang,
            messageOrInteraction: msg,
            owner: member.id,
            responses: [],
            trigger: triggerTyped,
            user: user,
        });
    },
};
exports.default = cmd;
//# sourceMappingURL=ticket.js.map
//# debugId=d30a831c-a2e0-578c-b8e5-1b35f03b941f
