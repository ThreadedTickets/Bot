"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="a917d3c9-40ce-539f-87bb-aea720443add")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lang_1 = require("../../lang");
const calculateUserPermissions_1 = require("../../utils/calculateUserPermissions");
const getServer_1 = require("../../utils/bot/getServer");
const onError_1 = require("../../utils/onError");
const unlock_1 = require("../../utils/tickets/unlock");
const button = {
    customId: "unlock",
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
                channel: interaction.channelId,
                guild: interaction.guildId,
            })).discordMsg);
        const userPermissions = (0, calculateUserPermissions_1.getUserPermissions)(interaction.member, await (0, getServer_1.getServerGroupsByIds)(ticket.groups, interaction.guildId));
        if (!userPermissions.tickets.canLock &&
            !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
            return interaction.editReply((await (0, onError_1.onError)(new Error("Missing unlock permission"), {
                ticketId: ticketId,
            })).discordMsg);
        await (0, unlock_1.unlockTicket)(ticketId, data.lang, interaction);
    },
};
exports.default = button;
//# sourceMappingURL=unlockTicket.js.map
//# debugId=a917d3c9-40ce-539f-87bb-aea720443add
