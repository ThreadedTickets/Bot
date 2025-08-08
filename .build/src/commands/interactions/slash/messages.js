"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="dee87ed4-5a62-5060-b264-0884dcc788fc")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const getServer_1 = require("../../../utils/bot/getServer");
const lang_1 = require("../../../lang");
const calculateUserPermissions_1 = require("../../../utils/calculateUserPermissions");
const onError_1 = require("../../../utils/onError");
const serverMessageToDiscordMessage_1 = __importDefault(require("../../../utils/formatters/serverMessageToDiscordMessage"));
const MessageCreator_1 = require("../../../database/modals/MessageCreator");
const updateCache_1 = require("../../../utils/database/updateCache");
const colours_1 = __importDefault(require("../../../constants/colours"));
const invalidateCache_1 = require("../../../utils/database/invalidateCache");
const Guild_1 = require("../../../database/modals/Guild");
function normalizeMessage(raw) {
    return {
        content: raw.content ?? "",
        components: raw.components ?? [],
        embeds: (raw.embeds ?? []).map((embed) => ({
            title: embed.title ?? null,
            description: embed.description ?? null,
            color: embed.color !== undefined
                ? `#${embed.color.toString(16).padStart(6, "0")}`
                : `#${colours_1.default.primary}`,
            fields: Array.isArray(embed.fields) ? embed.fields : [],
            author: {
                name: embed.author?.name ?? null,
                url: embed.author?.url ?? null,
                icon_url: embed.author?.icon_url ?? null,
            },
            footer: {
                text: embed.footer?.text ?? null,
                icon_url: embed.footer?.icon_url ?? null,
            },
            thumbnail: { url: embed.thumbnail?.url ?? null },
            image: { url: embed.image?.url ?? null },
            timestamp: typeof embed.timestamp === "boolean" || embed.timestamp instanceof Date
                ? embed.timestamp
                : null,
        })),
    };
}
const cmd = {
    type: "slash",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("messages")
        .setDescription("Messages configuration base")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageGuild)
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .addSubcommand((cmd) => cmd
        .setName("view")
        .setDescription("View a message")
        .addStringOption((opt) => opt
        .setName("message")
        .setDescription("Select the message to view")
        .setRequired(true)
        .setAutocomplete(true)))
        .addSubcommand((cmd) => cmd
        .setName("new")
        .setDescription("Create a new message")
        .addStringOption((opt) => opt
        .setName("name")
        .setDescription("The name of your new message")
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(100)))
        .addSubcommand((cmd) => cmd
        .setName("edit")
        .setDescription("Edit an existing message")
        .addStringOption((opt) => opt
        .setName("message")
        .setDescription("Which message do you want to edit?")
        .setRequired(true)
        .setAutocomplete(true))
        .addStringOption((opt) => opt
        .setName("new_name")
        .setDescription("The new name of your message")
        .setRequired(false)
        .setMinLength(2)
        .setMaxLength(100)))
        .addSubcommand((cmd) => cmd
        .setName("delete")
        .setDescription("Delete an existing message")
        .addStringOption((opt) => opt
        .setName("message")
        .setDescription("Which message do you want to delete?")
        .setRequired(true)
        .setAutocomplete(true))),
    async autocomplete(client, interaction) {
        if (!interaction.guildId)
            return;
        const focused = interaction.options.getFocused(true).name;
        if (focused === "message") {
            const messages = await (0, getServer_1.getServerMessages)(interaction.guildId);
            const focusedValue = interaction.options.getString("message", true);
            if (!messages.length) {
                interaction.respond([
                    {
                        name: "You don't have any messages!",
                        value: "",
                    },
                ]);
                return;
            }
            const filtered = messages.filter((m) => m.name.toLowerCase().includes(focusedValue.toLowerCase()));
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
        if (subcommand === "view") {
            if (!userPermissions.messages.create &&
                !userPermissions.messages.edit &&
                !userPermissions.messages.delete &&
                !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing view permission"))).discordMsg);
            const message = interaction.options.getString("message", true);
            const svrMsg = await (0, getServer_1.getServerMessage)(message, interaction.guildId);
            if (!message || !svrMsg)
                return interaction.editReply({
                    content: (0, lang_1.t)(lang, "CONFIG_CREATE_MESSAGE_NOT_FOUND"),
                });
            interaction
                .editReply((0, serverMessageToDiscordMessage_1.default)(svrMsg))
                .catch(async (err) => {
                const error = (await (0, onError_1.onError)(new Error("Invalid message")))
                    .discordMsg;
                if (!interaction.replied) {
                    interaction.editReply(error);
                }
                else {
                    interaction.followUp(error);
                }
            });
        }
        else if (subcommand === "new") {
            if (!userPermissions.messages.create &&
                !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.Administrator))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing create permission"))).discordMsg);
            const name = interaction.options.getString("name", true).trim();
            if (!new RegExp(/^[0-9a-zA-Z-_ ]{2,100}$/, "g").test(name)) {
                const error = (await (0, onError_1.onError)(new Error("Invalid name"))).discordMsg;
                interaction.editReply(error);
            }
            const document = await MessageCreator_1.MessageCreatorSchema.create({
                guildId: interaction.guildId,
                name: name,
                metadata: {
                    roles: interaction.guild?.roles.cache
                        .filter((r) => r.id != interaction.guildId)
                        .sort((a, b) => b.position - a.position)
                        .map((role) => ({
                        id: role.id,
                        name: role.name,
                        colour: role.hexColor,
                    })),
                    channels: interaction.guild?.channels.cache.map((channel) => ({
                        id: channel.id,
                        name: channel.name,
                        type: channel.type,
                    })),
                },
            });
            (0, updateCache_1.updateCachedData)(`messageCreators:${document._id}`, parseInt(process.env["TTL_MESSAGE_CREATORS"]), document.toObject());
            interaction.editReply({
                content: (0, lang_1.t)(lang, "MESSAGE_CREATE_GOTO_LINK", {
                    link: `${process.env["URL_MESSAGE_CREATOR"]}?id=${document._id}`,
                }),
            });
        }
        else if (subcommand === "edit") {
            if (!userPermissions.messages.edit &&
                !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.Administrator))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing edit permission"))).discordMsg);
            const id = interaction.options.getString("message", true);
            const message = await (0, getServer_1.getServerMessage)(id, interaction.guildId);
            if (!message) {
                const error = (await (0, onError_1.onError)(new Error("Message not found")))
                    .discordMsg;
                interaction.editReply(error);
                return;
            }
            const name = (interaction.options.getString("new_name") || message.name)
                .replace("[OLD]", "")
                .trim();
            if (!new RegExp(/^[0-9a-zA-Z-_ ]{2,100}$/, "g").test(name)) {
                const error = (await (0, onError_1.onError)(new Error("Invalid name"))).discordMsg;
                interaction.editReply(error);
            }
            const document = await MessageCreator_1.MessageCreatorSchema.create({
                guildId: interaction.guildId,
                name: name,
                existingMessage: normalizeMessage(message),
                metadata: {
                    link: id,
                    roles: interaction.guild?.roles.cache
                        .filter((r) => r.id != interaction.guildId)
                        .sort((a, b) => b.position - a.position)
                        .map((role) => ({
                        id: role.id,
                        name: role.name,
                        colour: role.hexColor,
                    })),
                    channels: interaction.guild?.channels.cache.map((channel) => ({
                        id: channel.id,
                        name: channel.name,
                        type: channel.type,
                    })),
                },
            });
            (0, updateCache_1.updateCachedData)(`messageCreators:${document._id}`, parseInt(process.env["TTL_MESSAGE_CREATORS"]), document.toObject());
            interaction.editReply({
                content: (0, lang_1.t)(lang, "MESSAGE_CREATE_GOTO_LINK", {
                    link: `${process.env["URL_MESSAGE_CREATOR"]}?id=${document._id}`,
                }),
            });
        }
        else if (subcommand === "delete") {
            if (!userPermissions.messages.delete &&
                !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.Administrator))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing delete permission"))).discordMsg);
            const id = interaction.options.getString("message", true);
            const message = await (0, getServer_1.getServerMessage)(id, interaction.guildId);
            if (!message) {
                const error = (await (0, onError_1.onError)(new Error("Message not found")))
                    .discordMsg;
                interaction.editReply(error);
                return;
            }
            await Guild_1.MessageSchema.findOneAndDelete({ _id: id });
            await (0, invalidateCache_1.invalidateCache)(`messages:${interaction.guildId}`);
            await (0, invalidateCache_1.invalidateCache)(`message:${id}`);
            interaction.editReply({
                content: (0, lang_1.t)(lang, "MESSAGE_DELETED"),
            });
        }
    },
};
exports.default = cmd;
//# sourceMappingURL=/src/commands/interactions/slash/messages.js.map
//# debugId=dee87ed4-5a62-5060-b264-0884dcc788fc
