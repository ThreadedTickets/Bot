"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="c3b6cc47-e2da-5d47-b42a-74b7eeecb886")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const calculateUserPermissions_1 = require("../../utils/calculateUserPermissions");
const getServer_1 = require("../../utils/bot/getServer");
const onError_1 = require("../../utils/onError");
const button = {
    customId: "close",
    async execute(client, data, interaction) {
        if (!interaction.guildId)
            return;
        const ticketId = interaction.customId.split(":")[1];
        const ticket = await (0, getServer_1.getTicket)(ticketId, interaction.guildId);
        if (!ticket)
            return interaction.reply((await (0, onError_1.onError)(new Error("Ticket not found"), {
                ticketId: ticketId,
            })).discordMsg);
        const userPermissions = (0, calculateUserPermissions_1.getUserPermissions)(interaction.member, await (0, getServer_1.getServerGroupsByIds)(ticket.groups, interaction.guildId));
        if (!userPermissions.tickets.canCloseIfOwn &&
            interaction.user.id === ticket.owner &&
            !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
            return interaction.reply((await (0, onError_1.onError)(new Error("Missing close-own permission"), {
                ticketId: ticketId,
            })).discordMsg);
        if (!userPermissions.tickets.canClose &&
            !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
            return interaction.reply((await (0, onError_1.onError)(new Error("Missing close permission"), {
                ticketId: ticketId,
            })).discordMsg);
        interaction.showModal(new discord_js_1.ModalBuilder()
            .setTitle("Close Ticket")
            .setCustomId(`close:${ticketId}`)
            .addComponents(new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.TextInputBuilder()
            .setCustomId("duration")
            .setLabel("Duration (10mins)")
            .setMaxLength(100)
            .setPlaceholder(`Leave blank to close instantly`)
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setRequired(false)), new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.TextInputBuilder()
            .setCustomId("reason")
            .setLabel("Reason")
            .setMaxLength(100)
            .setPlaceholder(`Why are you closing this ticket?`)
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setRequired(false))));
    },
};
exports.default = button;
//# sourceMappingURL=closeTicket.js.map
//# debugId=c3b6cc47-e2da-5d47-b42a-74b7eeecb886
