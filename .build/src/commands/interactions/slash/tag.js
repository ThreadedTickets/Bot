"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="690a61c0-9878-514d-988e-8aab3fa21b53")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const getServer_1 = require("../../../utils/bot/getServer");
const onError_1 = require("../../../utils/onError");
const resolvePlaceholders_1 = require("../../../utils/message/placeholders/resolvePlaceholders");
const serverMessageToDiscordMessage_1 = __importDefault(require("../../../utils/formatters/serverMessageToDiscordMessage"));
const generateBaseContext_1 = require("../../../utils/message/placeholders/generateBaseContext");
const command = {
    type: "slash",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("tag")
        .setDescription("Send a tag")
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .addStringOption((opt) => opt
        .setName("tag")
        .setDescription("Which tag do you want to send?")
        .setRequired(true)
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("preview")
        .setDescription("Do you want to preview this tag rather than send it?")
        .setChoices([
        { name: "Yes", value: "true" },
        { name: "No", value: "false" },
    ])),
    async autocomplete(client, interaction) {
        if (!interaction.guildId)
            return;
        const focused = interaction.options.getFocused(true).name;
        if (focused === "tag") {
            const focusedValue = interaction.options.getString("tag", true);
            const tags = await (0, getServer_1.getServerTags)(interaction.guildId);
            if (!tags.length) {
                interaction.respond([
                    {
                        name: "You don't have any tags!",
                        value: "",
                    },
                ]);
                return;
            }
            const filtered = tags.filter((m) => m.name.toLowerCase().includes(focusedValue.toLowerCase()));
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
        const showPreview = interaction.options.getString("preview") === "true";
        const tagId = interaction.options.getString("tag", true);
        const lang = data.lang;
        const tag = await (0, getServer_1.getServerTag)(tagId, interaction.guildId);
        if (!tag)
            return interaction.reply((await (0, onError_1.onError)(new Error("Tag not found"))).discordMsg);
        const message = await (0, getServer_1.getServerMessage)(tag.message, interaction.guildId);
        if (!message)
            return interaction.reply((await (0, onError_1.onError)(new Error("Tag message not found"))).discordMsg);
        interaction.reply({
            flags: showPreview ? [discord_js_1.MessageFlags.Ephemeral] : [],
            ...(0, resolvePlaceholders_1.resolveDiscordMessagePlaceholders)((0, serverMessageToDiscordMessage_1.default)(message), (0, generateBaseContext_1.generateBasePlaceholderContext)({
                server: interaction.guild,
                user: interaction.user,
                member: interaction.member,
                channel: interaction.channel,
            })),
        });
    },
};
exports.default = command;
//# sourceMappingURL=tag.js.map
//# debugId=690a61c0-9878-514d-988e-8aab3fa21b53
