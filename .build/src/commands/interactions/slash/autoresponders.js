"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="2666bec1-1344-5bd6-9322-234d571be1fa")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const getServer_1 = require("../../../utils/bot/getServer");
const lang_1 = require("../../../lang");
const calculateUserPermissions_1 = require("../../../utils/calculateUserPermissions");
const onError_1 = require("../../../utils/onError");
const limits_1 = __importDefault(require("../../../constants/limits"));
const generateId_1 = require("../../../utils/database/generateId");
const validateRegex_1 = require("../../../utils/formatters/validateRegex");
const updateCache_1 = require("../../../utils/database/updateCache");
const toTimeUnit_1 = require("../../../utils/formatters/toTimeUnit");
const colours_1 = __importDefault(require("../../../constants/colours"));
const AutoResponder_1 = require("../../../database/modals/AutoResponder");
const invalidateCache_1 = require("../../../utils/database/invalidateCache");
const __1 = require("../../..");
const cmd = {
    type: "slash",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("autoresponders")
        .setDescription("Auto Responder configuration base")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageGuild)
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .addSubcommand((cmd) => cmd
        .setName("view")
        .setDescription("View an auto responder")
        .addStringOption((opt) => opt
        .setName("responder")
        .setDescription("Select an auto responder")
        .setAutocomplete(true)
        .setRequired(true)))
        .addSubcommand((cmd) => cmd
        .setName("allowed_channels")
        .setDescription("Set the channels that auto responders are able to respond in"))
        .addSubcommand((cmd) => cmd
        .setName("new")
        .setDescription("Create an auto responder")
        .addStringOption((opt) => opt
        .setName("name")
        .setDescription("Choose a name")
        .setMinLength(2)
        .setMaxLength(100)
        .setRequired(true))
        .addStringOption((opt) => opt
        .setName("message")
        .setDescription("The new message of the tag")
        .setAutocomplete(true)
        .setRequired(true))
        .addStringOption((opt) => opt
        .setName("matcher_type")
        .setDescription("Choose a matcher type")
        .setRequired(true)
        .setChoices([
        {
            name: "Exact string",
            value: "exact",
        },
        {
            name: "Includes string",
            value: "includes",
        },
        {
            name: "Starts with string",
            value: "starts",
        },
        {
            name: "Ends with string",
            value: "ends",
        },
        {
            name: "Regex (Complex) matching",
            value: "regex",
        },
    ]))
        .addStringOption((opt) => opt
        .setName("ignore_emojis_and_markdown")
        .setDescription("Select scope")
        .setChoices([
        { name: "Yes", value: "true" },
        { name: "No", value: "false" },
    ])
        .setRequired(true))
        .addStringOption((opt) => opt
        .setName("process_as_lowercase")
        .setDescription("Select scope")
        .setChoices([
        { name: "Yes", value: "true" },
        { name: "No", value: "false" },
    ])
        .setRequired(true))
        .addStringOption((opt) => opt
        .setName("matcher")
        .setDescription("The value for your matcher")
        .setMinLength(1)
        .setMaxLength(300)
        .setRequired(true)))
        .addSubcommand((cmd) => cmd
        .setName("edit")
        .setDescription("Edit an auto responder")
        .addStringOption((opt) => opt
        .setName("responder")
        .setDescription("Select an auto responder")
        .setAutocomplete(true)
        .setRequired(true))
        .addStringOption((opt) => opt
        .setName("name")
        .setDescription("Choose a name")
        .setMinLength(2)
        .setMaxLength(100)
        .setRequired(false))
        .addStringOption((opt) => opt
        .setName("message")
        .setDescription("The new message of the tag")
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("matcher_type")
        .setDescription("Choose a matcher type")
        .setRequired(false)
        .setChoices([
        {
            name: "Exact string",
            value: "exact",
        },
        {
            name: "Includes string",
            value: "includes",
        },
        {
            name: "Starts with string",
            value: "starts",
        },
        {
            name: "Ends with string",
            value: "ends",
        },
        {
            name: "Regex (Complex) matching",
            value: "regex",
        },
    ]))
        .addStringOption((opt) => opt
        .setName("ignore_emojis_and_markdown")
        .setDescription("Select scope")
        .setChoices([
        { name: "Yes", value: "true" },
        { name: "No", value: "false" },
    ])
        .setRequired(false))
        .addStringOption((opt) => opt
        .setName("process_as_lowercase")
        .setDescription("Select scope")
        .setChoices([
        { name: "Yes", value: "true" },
        { name: "No", value: "false" },
    ])
        .setRequired(false))
        .addStringOption((opt) => opt
        .setName("matcher")
        .setDescription("The value for your matcher")
        .setMinLength(1)
        .setMaxLength(300)
        .setRequired(false)))
        .addSubcommand((cmd) => cmd
        .setName("delete")
        .setDescription("Delete an auto responder")
        .addStringOption((opt) => opt
        .setName("responder")
        .setDescription("Select an auto responder")
        .setAutocomplete(true)
        .setRequired(true))),
    async autocomplete(client, interaction) {
        if (!interaction.guildId)
            return;
        const focused = interaction.options.getFocused(true).name;
        if (focused === "responder") {
            const focusedValue = interaction.options.getString("responder", true);
            const responders = await (0, getServer_1.getServerResponders)(interaction.guildId);
            if (!responders.length) {
                interaction.respond([
                    {
                        name: "You don't have any responders!",
                        value: "",
                    },
                ]);
                return;
            }
            const filtered = responders.filter((m) => m.name.toLowerCase().includes(focusedValue.toLowerCase()));
            interaction.respond(filtered
                .map((m) => ({
                name: m.name,
                value: m._id,
            }))
                .slice(0, 25));
        }
        else if (focused === "message") {
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
    },
    async execute(client, data, interaction) {
        if (!interaction.guildId)
            return;
        const subcommand = interaction.options.getSubcommand(true);
        const lang = data.lang;
        await interaction.reply({
            content: (0, lang_1.t)(data.lang, "THINK"),
            flags: [discord_js_1.MessageFlags.Ephemeral],
        });
        const groups = await (0, getServer_1.getServerGroups)(interaction.guildId);
        const userPermissions = (0, calculateUserPermissions_1.getUserPermissions)(interaction.member, groups);
        if (subcommand === "allowed_channels") {
            if (!userPermissions.autoResponders.edit &&
                !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing edit permission"))).discordMsg);
            const server = await (0, getServer_1.getServer)(interaction.guildId);
            interaction.editReply({
                content: (0, lang_1.t)(lang, "SET_AUTO_RESPONDER_ALLOWED_CHANNELS"),
                components: [
                    new discord_js_1.ActionRowBuilder()
                        .addComponents(new discord_js_1.ChannelSelectMenuBuilder()
                        .addChannelTypes(discord_js_1.ChannelType.PrivateThread, discord_js_1.ChannelType.AnnouncementThread, discord_js_1.ChannelType.GuildAnnouncement, discord_js_1.ChannelType.GuildText, discord_js_1.ChannelType.PublicThread)
                        .setCustomId("autoResponderChannels")
                        .setDefaultChannels(server.settings.autoResponders?.extraAllowedChannels || [])
                        .setPlaceholder("Select channels")
                        .setMaxValues(limits_1.default.free.autoResponders.extraChannels))
                        .toJSON(),
                ],
            });
        }
        else if (subcommand === "new") {
            if (!userPermissions.autoResponders.create &&
                !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing create permission"))).discordMsg);
            const responders = await (0, getServer_1.getServerResponders)(interaction.guildId);
            if (responders.length >= limits_1.default.free.autoResponders.amount)
                return interaction.editReply((await (0, onError_1.onError)(new Error("Auto responder limit reached"))).discordMsg);
            const id = (0, generateId_1.generateId)("AR");
            const name = interaction.options.getString("name", true);
            const messageId = interaction.options.getString("message", true);
            const scope = {
                clean: interaction.options.getString("ignore_emojis_and_markdown", true) ===
                    "true",
                normalized: interaction.options.getString("process_as_lowercase", true) ===
                    "true",
            };
            const matcherType = interaction.options.getString("matcher_type", true);
            const matcher = interaction.options.getString("matcher", true);
            const message = await (0, getServer_1.getServerMessage)(messageId, interaction.guildId);
            if (!message)
                return interaction.editReply((await (0, onError_1.onError)(new Error("Message not found"))).discordMsg);
            if (matcherType === "regex") {
                const validRegex = (0, validateRegex_1.validateUserRegex)(matcher);
                if (!validRegex.valid)
                    return interaction.editReply((await (0, onError_1.onError)(new Error("Invalid regex"))).discordMsg);
            }
            const responder = await AutoResponder_1.AutoResponderSchema.create({
                _id: id,
                name: name,
                server: interaction.guildId,
                message: messageId,
                matcher: matcher,
                matcherScope: scope,
                matcherType: matcherType,
            });
            interaction.editReply({
                content: (0, lang_1.t)(lang, "RESPONDER_CREATED"),
            });
            await (0, invalidateCache_1.invalidateCache)(`responders:${interaction.guildId}`);
            (0, updateCache_1.updateCachedData)(`responder:${id}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 10), responder.toObject());
            // This just loads the updated responders back into cache
            (0, getServer_1.getServerResponders)(interaction.guildId);
        }
        else if (subcommand === "view") {
            if ((!userPermissions.autoResponders.create ||
                !userPermissions.autoResponders.edit ||
                !userPermissions.autoResponders.delete) &&
                !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing view permission"))).discordMsg);
            const responderId = interaction.options.getString("responder", true);
            const responder = await (0, getServer_1.getServerResponder)(responderId, interaction.guildId);
            if (!responder)
                return interaction.editReply((await (0, onError_1.onError)(new Error("Responder not found"))).discordMsg);
            interaction.editReply({
                embeds: [
                    {
                        color: parseInt(colours_1.default.info, 16),
                        title: (0, lang_1.t)(lang, "RESPONDER_INFO_TITLE"),
                        fields: [
                            {
                                name: (0, lang_1.t)(lang, "MATCHER_TYPE"),
                                inline: true,
                                value: (0, lang_1.t)(lang, `MATCHER_TYPE_${responder.matcherType.toUpperCase()}`),
                            },
                            {
                                name: (0, lang_1.t)(lang, "MATCHER_SCOPES"),
                                inline: true,
                                value: `${(0, lang_1.t)(lang, `MATCHER_SCOPES_CLEAN`)}${(0, lang_1.t)(lang, responder.matcherScope.clean ? "YES" : "NO")}\n${(0, lang_1.t)(lang, `MATCHER_SCOPES_NORMALIZE`)}${(0, lang_1.t)(lang, responder.matcherScope.normalize ? "YES" : "NO")}`,
                            },
                            {
                                name: (0, lang_1.t)(lang, "MATCHER"),
                                value: `\`${responder.matcher}\``,
                            },
                            {
                                name: (0, lang_1.t)(lang, "MATCHER_MATCH_EXAMPLE"),
                                value: `\`${(0, validateRegex_1.generateExampleRegex)(responder.matcher)}\``,
                            },
                        ],
                    },
                ],
            });
        }
        else if (subcommand === "edit") {
            if (!userPermissions.autoResponders.edit &&
                !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing edit permission"))).discordMsg);
            const responderId = interaction.options.getString("responder", true);
            const name = interaction.options.getString("name");
            const messageId = interaction.options.getString("message");
            const cleanScope = interaction.options.getString("ignore_emojis_and_markdown");
            const normalizedScope = interaction.options.getString("process_as_lowercase");
            const matcherType = interaction.options.getString("matcher_type");
            const matcher = interaction.options.getString("matcher");
            if (!name &&
                !messageId &&
                !matcherType &&
                !matcher &&
                !cleanScope &&
                !normalizedScope)
                return interaction.editReply((await (0, onError_1.onError)(new Error("Invalid usage"))).discordMsg);
            const responder = await (0, getServer_1.getServerResponder)(responderId, interaction.guildId);
            if (!responder)
                return interaction.editReply((await (0, onError_1.onError)(new Error("Responder not found"))).discordMsg);
            if (matcherType === "regex") {
                const validRegex = (0, validateRegex_1.validateUserRegex)(matcher || responder.matcher);
                if (!validRegex.valid)
                    return interaction.editReply((await (0, onError_1.onError)(new Error("Invalid regex"))).discordMsg);
            }
            const message = await (0, getServer_1.getServerMessage)(messageId || responder.message, interaction.guildId);
            if (!message)
                return interaction.editReply((await (0, onError_1.onError)(new Error("Message not found"))).discordMsg);
            interaction.editReply({
                content: (0, lang_1.t)(lang, "RESPONDER_UPDATED"),
            });
            await AutoResponder_1.AutoResponderSchema.findOneAndUpdate({
                _id: responderId,
            }, {
                name: interaction.options.getString("name") || responder.name,
                message: message._id,
                matcherScope: {
                    clean: cleanScope || responder.matcherScope.clean,
                    normalize: normalizedScope || responder.matcherScope.normalize,
                },
                matcher: matcher || responder.matcher,
                matcherType: matcherType || responder.matcherType,
            });
            await (0, invalidateCache_1.invalidateCache)(`responders:${interaction.guildId}`);
            await (0, invalidateCache_1.invalidateCache)(`responder:${responderId}`);
            __1.InMemoryCache.invalidate(`responders:${interaction.guildId}`);
        }
        else if (subcommand === "delete") {
            if (!userPermissions.autoResponders.delete &&
                !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing delete permission"))).discordMsg);
            const responderId = interaction.options.getString("responder", true);
            const responder = await (0, getServer_1.getServerResponder)(responderId, interaction.guildId);
            if (!responder)
                return interaction.editReply((await (0, onError_1.onError)(new Error("Responder not found"))).discordMsg);
            await AutoResponder_1.AutoResponderSchema.findOneAndDelete({ _id: responderId });
            await (0, invalidateCache_1.invalidateCache)(`responders:${interaction.guildId}`);
            await (0, invalidateCache_1.invalidateCache)(`responder:${responderId}`);
            __1.InMemoryCache.invalidate(`responders:${interaction.guildId}`);
            interaction.editReply({
                content: (0, lang_1.t)(lang, "RESPONDER_DELETED"),
            });
        }
    },
};
exports.default = cmd;
//# sourceMappingURL=/src/commands/interactions/slash/autoresponders.js.map
//# debugId=2666bec1-1344-5bd6-9322-234d571be1fa
