"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="e4cb58ce-303e-5b88-880b-202aac6fdba7")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const getServer_1 = require("../../../utils/bot/getServer");
const onError_1 = require("../../../utils/onError");
const command = {
    type: "slash",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("get_trigger_id")
        .setDescription("A command to help you get a ticket trigger ID")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageGuild)
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .addStringOption((opt) => opt
        .setName("trigger")
        .setDescription("Choose a trigger")
        .setRequired(true)
        .setAutocomplete(true)),
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
                        name: "You don't have any ticket triggers!",
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
        const trigger = await (0, getServer_1.getServerTicketTrigger)(interaction.options.getString("trigger", true), interaction.guildId);
        if (!trigger) {
            const error = (await (0, onError_1.onError)(new Error("Trigger not found"))).discordMsg;
            interaction.reply(error);
            return;
        }
        interaction.reply({
            flags: [discord_js_1.MessageFlags.Ephemeral],
            content: trigger._id,
        });
    },
};
exports.default = command;
//# sourceMappingURL=getTriggerId.js.map
//# debugId=e4cb58ce-303e-5b88-880b-202aac6fdba7
