"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="c2eb5b1e-4b32-59cc-963d-2fbe3861ac22")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lang_1 = require("../../lang");
const calculateUserPermissions_1 = require("../../utils/calculateUserPermissions");
const getServer_1 = require("../../utils/bot/getServer");
const onError_1 = require("../../utils/onError");
const reopen_1 = require("../../utils/tickets/reopen");
const button = {
    customId: "reopen",
    async execute(client, data, interaction) {
        if (!interaction.guildId)
            return;
        await interaction.reply({
            content: (0, lang_1.t)(data.lang, "THINK"),
            flags: [discord_js_1.MessageFlags.Ephemeral],
        });
        const ticketId = interaction.customId.split(":")[1];
        const ticket = await (0, getServer_1.getTicket)(ticketId, interaction.guildId);
        if (!ticket)
            return interaction.editReply((await (0, onError_1.onError)(new Error("Ticket not found"), {
                ticketId: ticketId,
            })).discordMsg);
        const userPermissions = (0, calculateUserPermissions_1.getUserPermissions)(interaction.member, await (0, getServer_1.getServerGroupsByIds)(ticket.groups, interaction.guildId));
        if (!userPermissions.tickets.canClose &&
            !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
            return interaction.editReply((await (0, onError_1.onError)(new Error("Missing reopen permission"), {
                ticketId: ticketId,
            })).discordMsg);
        await (0, reopen_1.reopenTicket)(ticketId, data.lang, interaction);
    },
};
exports.default = button;
//# sourceMappingURL=reopenTicket.js.map
//# debugId=c2eb5b1e-4b32-59cc-963d-2fbe3861ac22
