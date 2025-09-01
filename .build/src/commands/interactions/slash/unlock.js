"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="120a722d-9a14-51ba-91d4-12c2585fabe9")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lang_1 = require("../../../lang");
const TicketChannelManager_1 = require("../../../utils/bot/TicketChannelManager");
const getServer_1 = require("../../../utils/bot/getServer");
const onError_1 = require("../../../utils/onError");
const calculateUserPermissions_1 = require("../../../utils/calculateUserPermissions");
const unlock_1 = require("../../../utils/tickets/unlock");
const command = {
    type: "slash",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("unlock")
        .setDescription("Unlock the ticket")
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setNameLocalizations({})
        .setDescriptionLocalizations({}),
    async execute(client, data, interaction) {
        if (!interaction.guildId)
            return;
        const ticketId = await new TicketChannelManager_1.TicketChannelManager().getTicketId(interaction.channelId);
        if (!ticketId)
            return interaction.reply((await (0, onError_1.onError)(new Error("Ticket not found"), {
                ticketId: ticketId,
            })).discordMsg);
        const ticket = await (0, getServer_1.getTicket)(ticketId, interaction.guildId);
        if (!ticket)
            return interaction.reply((await (0, onError_1.onError)(new Error("Ticket not found"), {
                ticketId: ticketId,
            })).discordMsg);
        const userPermissions = (0, calculateUserPermissions_1.getUserPermissions)(interaction.member, await (0, getServer_1.getServerGroupsByIds)(ticket.groups, interaction.guildId));
        if (!userPermissions.tickets.canUnlock &&
            !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
            return interaction.reply((await (0, onError_1.onError)(new Error("Missing unlock permission"), {
                ticketId: ticketId,
            })).discordMsg);
        await interaction.reply({
            content: (0, lang_1.t)(data.lang, "THINK"),
            flags: [discord_js_1.MessageFlags.Ephemeral],
        });
        await (0, unlock_1.unlockTicket)(ticketId, data.lang, interaction);
    },
};
exports.default = command;
//# sourceMappingURL=/src/commands/interactions/slash/unlock.js.map
//# debugId=120a722d-9a14-51ba-91d4-12c2585fabe9
