"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="5903efe8-d9a8-5237-be62-8a0dbd9f736c")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const getServer_1 = require("../../../utils/bot/getServer");
const onError_1 = require("../../../utils/onError");
const lang_1 = require("../../../lang");
const hooks_1 = require("../../../utils/hooks");
const performChecks_1 = require("../../../utils/tickets/performChecks");
const buildFormModal_1 = require("../../../utils/tickets/buildFormModal");
const calculateUserPermissions_1 = require("../../../utils/calculateUserPermissions");
const __1 = require("../../..");
const command = {
    type: "slash",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Open a ticket")
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageChannels)
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .addStringOption((opt) => opt
        .setName("trigger")
        .setDescription("Select a trigger to open a ticket with")
        .setRequired(true)
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .setAutocomplete(true))
        .addUserOption((opt) => opt
        .setName("user")
        .setDescription("Force a user into a ticket (requires permission)")
        .setRequired(false)),
    async autocomplete(client, interaction) {
        if (!interaction.guildId)
            return;
        const focused = interaction.options.getFocused(true).name;
        if (focused === "trigger") {
            const focusedValue = interaction.options.getString("trigger", true);
            const triggers = await (0, getServer_1.getServerTicketTriggers)(interaction.guildId);
            if (!triggers.length) {
                interaction.respond([
                    {
                        name: "There are no triggers!",
                        value: "",
                    },
                ]);
                return;
            }
            const filtered = triggers.filter((m) => m.label.toLowerCase().includes(focusedValue.toLowerCase()));
            interaction.respond(filtered
                .map((m) => ({
                name: m.label,
                value: m._id,
            }))
                .slice(0, 25));
        }
    },
    async execute(client, data, interaction) {
        if (!interaction.guildId)
            return;
        const member = (interaction.options.getMember("user") ||
            interaction.member);
        const user = (interaction.options.getUser("user") ||
            interaction.user);
        const trigger = await (0, getServer_1.getServerTicketTrigger)(interaction.options.getString("trigger", true), interaction.guildId);
        if (!trigger)
            return interaction.reply((await (0, onError_1.onError)(new Error("Trigger not found"))).discordMsg);
        const triggerObject = trigger.toObject();
        const triggerTyped = {
            ...triggerObject,
        };
        if (trigger.form.length && interaction.user.id === user.id) {
            const modal = (0, buildFormModal_1.buildTicketFormModal)(triggerTyped.form, `ticket:${trigger._id}`, triggerTyped.label);
            if (modal instanceof Error)
                return await interaction.reply({
                    ...(await (0, onError_1.onError)(new Error(modal.message), { stack: modal.stack })).discordMsg,
                    flags: [discord_js_1.MessageFlags.Ephemeral],
                });
            return interaction.showModal(modal);
        }
        await interaction.reply({
            content: (0, lang_1.t)(data.lang, "TICKET_CREATE_PERFORMING_CHECKS"),
            flags: [discord_js_1.MessageFlags.Ephemeral],
        });
        const userPermissions = (0, calculateUserPermissions_1.getUserPermissions)(interaction.member, await (0, getServer_1.getServerGroupsByIds)(trigger.groups, interaction.guildId));
        if (!userPermissions.tickets.canForceOpen &&
            !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
            return interaction.editReply((await (0, onError_1.onError)(new Error("Missing force-open permission"))).discordMsg);
        __1.ticketQueueManager.wrap(async () => {
            const checks = await (0, performChecks_1.performTicketChecks)(triggerTyped, member);
            if (!checks.allowed) {
                return interaction.editReply((await (0, onError_1.onError)(new Error((0, lang_1.t)(data.lang, `ERROR_CODE_${checks.error}`)))).discordMsg);
            }
            const checkTargetChannel = await (0, performChecks_1.canCreateTicketTarget)(interaction.guild, trigger.isThread ? "thread" : "channel", trigger.openChannel || interaction.channelId);
            if (!checkTargetChannel.allowed)
                return interaction.editReply((await (0, onError_1.onError)(new Error((0, lang_1.t)(data.lang, `ERROR_CODE_${checkTargetChannel.error}`)))).discordMsg);
            await interaction.editReply({
                content: (0, lang_1.t)(data.lang, "TICKET_CREATE_CHECKS_PASSED"),
            });
            await (0, hooks_1.runHooks)("TicketCreate", {
                client: client,
                guild: interaction.guild,
                lang: data.lang,
                messageOrInteraction: interaction,
                owner: member.id,
                responses: [],
                trigger: triggerTyped,
                user: user,
            });
        }, interaction.guildId);
    },
};
exports.default = command;
//# sourceMappingURL=ticket.js.map
//# debugId=5903efe8-d9a8-5237-be62-8a0dbd9f736c
