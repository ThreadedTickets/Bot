"use strict";
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
const Tag_1 = require("../../../database/modals/Tag");
const invalidateCache_1 = require("../../../utils/database/invalidateCache");
const updateCache_1 = require("../../../utils/database/updateCache");
const toTimeUnit_1 = require("../../../utils/formatters/toTimeUnit");
const serverMessageToDiscordMessage_1 = __importDefault(require("../../../utils/formatters/serverMessageToDiscordMessage"));
const cmd = {
    type: "slash",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("tags")
        .setDescription("Tag configuration base")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageMessages)
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .addSubcommand((cmd) => cmd
        .setName("view")
        .setDescription("View a tag")
        .addStringOption((opt) => opt
        .setName("tag")
        .setDescription("Select a tag")
        .setAutocomplete(true)
        .setRequired(true)))
        .addSubcommand((cmd) => cmd
        .setName("new")
        .setDescription("Create a new tag")
        .addStringOption((opt) => opt
        .setName("name")
        .setDescription("The name of this tag")
        .setRequired(true)
        .setMaxLength(100)
        .setMinLength(2))
        .addStringOption((opt) => opt
        .setName("message")
        .setDescription("The new message of the tag")
        .setAutocomplete(true)
        .setRequired(true)))
        .addSubcommand((cmd) => cmd
        .setName("delete")
        .setDescription("Delete a tag")
        .addStringOption((opt) => opt
        .setName("tag")
        .setDescription("The name of the tag to edit")
        .setAutocomplete(true)
        .setRequired(true)))
        .addSubcommand((cmd) => cmd
        .setName("edit")
        .setDescription("Create a new tag")
        .addStringOption((opt) => opt
        .setName("tag")
        .setDescription("The name of the tag to edit")
        .setAutocomplete(true)
        .setRequired(true))
        .addStringOption((opt) => opt
        .setName("name")
        .setDescription("The new name of the tag")
        .setMaxLength(100)
        .setMinLength(2))
        .addStringOption((opt) => opt
        .setName("message")
        .setDescription("The new message of the tag")
        .setAutocomplete(true))),
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
        if (subcommand === "new") {
            if (!userPermissions.tags.create &&
                !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing create permission"))).discordMsg);
            const tags = await (0, getServer_1.getServerTags)(interaction.guildId);
            if (tags.length >= limits_1.default.free.tags.amount)
                return interaction.editReply((await (0, onError_1.onError)(new Error("Tag limit reached"))).discordMsg);
            const id = (0, generateId_1.generateId)("GT");
            const name = interaction.options.getString("name", true);
            const messageId = interaction.options.getString("message", true);
            const message = await (0, getServer_1.getServerMessage)(messageId, interaction.guildId);
            if (!message)
                return interaction.editReply((await (0, onError_1.onError)(new Error("Message not found"))).discordMsg);
            const tag = await Tag_1.TagSchema.create({
                _id: id,
                name: name,
                server: interaction.guildId,
                message: messageId,
            });
            interaction.editReply({
                content: (0, lang_1.t)(lang, "TAG_CREATED"),
            });
            await (0, invalidateCache_1.invalidateCache)(`tags:${interaction.guildId}`);
            (0, updateCache_1.updateCachedData)(`tag:${id}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 10), tag.toObject());
        }
        else if (subcommand === "view") {
            if ((!userPermissions.tags.create ||
                !userPermissions.tags.edit ||
                !userPermissions.tags.delete) &&
                !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing view permission"))).discordMsg);
            const tagId = interaction.options.getString("tag", true);
            const tag = await (0, getServer_1.getServerTag)(tagId, interaction.guildId);
            if (!tag)
                return interaction.editReply((await (0, onError_1.onError)(new Error("Tag not found"))).discordMsg);
            const message = await (0, getServer_1.getServerMessage)(tag.message, interaction.guildId);
            if (!message)
                return interaction.editReply((await (0, onError_1.onError)(new Error("Tag message not found"))).discordMsg);
            interaction.editReply({
                ...(0, serverMessageToDiscordMessage_1.default)(message),
            });
        }
        else if (subcommand === "edit") {
            if (!userPermissions.tags.edit &&
                !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing edit permission"))).discordMsg);
            const tagId = interaction.options.getString("tag", true);
            const name = interaction.options.getString("name");
            const messageId = interaction.options.getString("message");
            if (!name && !messageId)
                return interaction.editReply((await (0, onError_1.onError)(new Error("Invalid usage"))).discordMsg);
            const tag = await (0, getServer_1.getServerTag)(tagId, interaction.guildId);
            if (!tag)
                return interaction.editReply((await (0, onError_1.onError)(new Error("Tag not found"))).discordMsg);
            const message = await (0, getServer_1.getServerMessage)(messageId || tag.message, interaction.guildId);
            if (!message)
                return interaction.editReply((await (0, onError_1.onError)(new Error("Message not found"))).discordMsg);
            interaction.editReply({
                content: (0, lang_1.t)(lang, "TAG_UPDATED"),
            });
            await Tag_1.TagSchema.findOneAndUpdate({
                _id: tagId,
            }, {
                name: interaction.options.getString("name") || tag.name,
                message: message._id,
            });
            await (0, invalidateCache_1.invalidateCache)(`tags:${interaction.guildId}`);
            // We don't need to worry about invalidating the individual tag cache as this is only used for the message
        }
        else if (subcommand === "delete") {
            if (!userPermissions.tags.delete &&
                !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing delete permission"))).discordMsg);
            const tagId = interaction.options.getString("tag", true);
            const tag = await (0, getServer_1.getServerTag)(tagId, interaction.guildId);
            if (!tag)
                return interaction.editReply((await (0, onError_1.onError)(new Error("Tag not found"))).discordMsg);
            await Tag_1.TagSchema.findOneAndDelete({ _id: tagId });
            await (0, invalidateCache_1.invalidateCache)(`tags:${interaction.guildId}`);
            await (0, invalidateCache_1.invalidateCache)(`tag:${tagId}`);
            interaction.editReply({
                content: (0, lang_1.t)(lang, "TAG_DELETED"),
            });
        }
    },
};
exports.default = cmd;
//# sourceMappingURL=/src/commands/interactions/slash/tags.js.map