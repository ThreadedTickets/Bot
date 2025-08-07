"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="ecfae2a7-c611-5e6e-a307-f478d54fb1ee")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const getServer_1 = require("../../../utils/bot/getServer");
const onError_1 = require("../../../utils/onError");
const lang_1 = require("../../../lang");
const resolvePlaceholders_1 = require("../../../utils/message/placeholders/resolvePlaceholders");
const serverMessageToDiscordMessage_1 = __importDefault(require("../../../utils/formatters/serverMessageToDiscordMessage"));
const generateBaseContext_1 = require("../../../utils/message/placeholders/generateBaseContext");
const duration_1 = require("../../../utils/formatters/duration");
const calculateUserPermissions_1 = require("../../../utils/calculateUserPermissions");
const logger_1 = __importDefault(require("../../../utils/logger"));
const command = {
    type: "slash",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("panel")
        .setDescription("Create a new panel!")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageGuild)
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .addStringOption((opt) => opt
        .setName("message")
        .setDescription("Choose a trigger")
        .setRequired(true)
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("type")
        .setDescription("What component type should the panel use?")
        .setRequired(true)
        .setChoices([
        { name: "Buttons (better for 1-5 triggers)", value: "button" },
        { name: "Dropdown (better for 5+ triggers)", value: "select" },
    ]))
        .addStringOption((opt) => opt
        .setName("trigger_1")
        .setDescription("Pick a trigger")
        .setRequired(true)
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("dropdown_placeholder")
        .setDescription("Only needed if doing a dropdown panel")
        .setMaxLength(100))
        .addStringOption((opt) => opt
        .setName("trigger_2")
        .setDescription("Pick a trigger")
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("trigger_3")
        .setDescription("Pick a trigger")
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("trigger_4")
        .setDescription("Pick a trigger")
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("trigger_5")
        .setDescription("Pick a trigger")
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("trigger_6")
        .setDescription("Pick a trigger")
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("trigger_7")
        .setDescription("Pick a trigger")
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("trigger_8")
        .setDescription("Pick a trigger")
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("trigger_9")
        .setDescription("Pick a trigger")
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("trigger_10")
        .setDescription("Pick a trigger")
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("trigger_11")
        .setDescription("Pick a trigger")
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("trigger_12")
        .setDescription("Pick a trigger")
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("trigger_13")
        .setDescription("Pick a trigger")
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("trigger_14")
        .setDescription("Pick a trigger")
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("trigger_15")
        .setDescription("Pick a trigger")
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("trigger_16")
        .setDescription("Pick a trigger")
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("trigger_17")
        .setDescription("Pick a trigger")
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("trigger_18")
        .setDescription("Pick a trigger")
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("trigger_19")
        .setDescription("Pick a trigger")
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("trigger_20")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)),
    async autocomplete(client, interaction) {
        if (!interaction.guildId)
            return;
        const focused = interaction.options.getFocused(true).name;
        if (focused === "message") {
            const focusedValue = interaction.options.getString("message", true);
            const message = await (0, getServer_1.getServerMessages)(interaction.guildId);
            if (!message.length) {
                interaction.respond([
                    {
                        name: "You don't have any message!",
                        value: "",
                    },
                ]);
                return;
            }
            const filtered = message.filter((m) => m.name.toLowerCase().includes(focusedValue.toLowerCase()));
            interaction.respond(filtered
                .map((m) => ({
                name: m.name,
                value: m._id,
            }))
                .slice(0, 25));
        }
        else if (focused.startsWith("trigger")) {
            const focusedValue = interaction.options.getString(`trigger_${focused.split("_")[1]}`, true);
            const triggers = [
                ...(await (0, getServer_1.getServerApplications)(interaction.guildId)),
                ...(await (0, getServer_1.getServerTicketTriggers)(interaction.guildId)),
            ];
            if (!triggers.length) {
                interaction.respond([
                    {
                        name: "You don't have any triggers!",
                        value: "",
                    },
                ]);
                return;
            }
            const filtered = triggers.filter((m) => "name" in m
                ? m.name.toLowerCase().includes(focusedValue.toLowerCase())
                : m.label.toLowerCase().includes(focusedValue.toLowerCase()));
            interaction.respond(filtered
                .map((m) => ({
                name: "name" in m
                    ? `[Application] ${m.name}`.slice(0, 100)
                    : `[Ticket] ${m.label}`.slice(0, 100),
                value: m._id,
            }))
                .slice(0, 25));
        }
    },
    async execute(client, data, interaction) {
        if (!interaction.guildId)
            return;
        const start = new Date();
        const groups = await (0, getServer_1.getServerGroups)(interaction.guildId);
        const userPermissions = (0, calculateUserPermissions_1.getUserPermissions)(interaction.member, groups);
        if (!userPermissions.panels.manage &&
            !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
            return interaction.reply((await (0, onError_1.onError)(new Error("Missing manage permission"))).discordMsg);
        const message = await (0, getServer_1.getServerMessage)(interaction.options.getString("message", true), interaction.guildId);
        if (!message) {
            const error = (await (0, onError_1.onError)(new Error("Message not found"))).discordMsg;
            interaction.reply(error);
            return;
        }
        await interaction.reply({
            content: (0, lang_1.t)(data.lang, "PROCESSING_PANEL"),
            flags: [discord_js_1.MessageFlags.Ephemeral],
        });
        const triggerValues = interaction.options.data
            .filter((opt) => opt.name.startsWith("trigger_") && opt.value != null)
            .sort((a, b) => Number(a.name.split("_")[1]) - Number(b.name.split("_")[1]))
            .map((opt) => opt.value);
        // Validate all values
        const ticketTriggers = await (0, getServer_1.getServerTicketTriggers)(interaction.guildId);
        const applicationTriggers = await (0, getServer_1.getServerApplications)(interaction.guildId);
        const validTriggers = [];
        for (const value of triggerValues) {
            if (value.startsWith("TT_")) {
                const ticket = ticketTriggers.find((t) => t._id === value);
                if (!ticket)
                    continue;
                validTriggers.push({
                    label: ticket.label,
                    description: ticket.description,
                    colour: ticket.colour,
                    value: `ticket:${ticket._id}`,
                });
            }
            else {
                const app = applicationTriggers.find((a) => a._id === value);
                if (!app)
                    continue;
                validTriggers.push({
                    label: app.name,
                    colour: discord_js_1.ButtonStyle.Secondary,
                    value: `apply:${app._id}`,
                });
            }
        }
        const channel = interaction.channel;
        channel.send({
            ...(0, resolvePlaceholders_1.resolveDiscordMessagePlaceholders)((0, serverMessageToDiscordMessage_1.default)(message), (0, generateBaseContext_1.generateBasePlaceholderContext)({ server: interaction.guild })),
            components: buildTriggerActionRows(validTriggers, interaction.options.getString("type", true), interaction.options.getString("dropdown_placeholder") ?? "Open a ticket"),
        });
        logger_1.default.debug(`Processing new panel took ${(0, duration_1.formatDuration)(new Date().getTime() - start.getTime())}`);
    },
};
exports.default = command;
function buildTriggerActionRows(triggers, type, placeholder) {
    // Remove duplicates by `value`
    const uniqueTriggers = Array.from(new Map(triggers.map((t) => [t.value, t])).values());
    if (type === "button") {
        const rows = [];
        for (let i = 0; i < uniqueTriggers.length; i += 5) {
            const chunk = uniqueTriggers.slice(i, i + 5);
            const row = new discord_js_1.ActionRowBuilder().addComponents(...chunk.map((trigger) => new discord_js_1.ButtonBuilder()
                .setCustomId(trigger.value)
                .setLabel(trigger.label)
                .setStyle(trigger.colour ?? discord_js_1.ButtonStyle.Secondary)));
            rows.push(row);
        }
        return rows;
    }
    if (type === "select") {
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId("ticket")
            .setPlaceholder(placeholder)
            .addOptions(uniqueTriggers.slice(0, 25).map((trigger) => {
            const option = new discord_js_1.StringSelectMenuOptionBuilder()
                .setLabel(trigger.label)
                .setValue(trigger.value);
            if (trigger.description) {
                option.setDescription(trigger.description.slice(0, 100));
            }
            return option;
        })));
        return [row];
    }
    throw new Error("Invalid type: must be 'button' or 'select'");
}
//# sourceMappingURL=panel.js.map
//# debugId=ecfae2a7-c611-5e6e-a307-f478d54fb1ee
