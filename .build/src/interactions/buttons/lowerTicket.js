"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="52a89c4f-fedc-5c4a-9078-00e5316793ee")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lang_1 = require("../../lang");
const calculateUserPermissions_1 = require("../../utils/calculateUserPermissions");
const getServer_1 = require("../../utils/bot/getServer");
const onError_1 = require("../../utils/onError");
const lower_1 = require("../../utils/tickets/lower");
const button = {
    customId: "lower",
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
        if (!userPermissions.tickets.canUnlock &&
            !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
            return interaction.editReply((await (0, onError_1.onError)(new Error("Missing unlock permission"), {
                ticketId: ticketId,
            })).discordMsg);
        await (0, lower_1.lowerTicket)(ticketId, data.lang, interaction);
    },
};
exports.default = button;
//# sourceMappingURL=lowerTicket.js.map
//# debugId=52a89c4f-fedc-5c4a-9078-00e5316793ee
