"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="83365e4b-7b6a-5cb4-8f06-06ff01693752")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const getServer_1 = require("../../../utils/bot/getServer");
const lang_1 = require("../../../lang");
const calculateUserPermissions_1 = require("../../../utils/calculateUserPermissions");
const GroupCreator_1 = require("../../../database/modals/GroupCreator");
const onError_1 = require("../../../utils/onError");
const updateCache_1 = require("../../../utils/database/updateCache");
const invalidateCache_1 = require("../../../utils/database/invalidateCache");
const Guild_1 = require("../../../database/modals/Guild");
const cmd = {
    type: "slash",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("groups")
        .setDescription("Groups configuration base")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageGuild)
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .addSubcommand((cmd) => cmd.setName("new").setDescription("Create a new group"))
        .addSubcommand((cmd) => cmd
        .setName("edit")
        .setDescription("Edit an existing group")
        .addStringOption((opt) => opt
        .setName("group")
        .setDescription("Which group do you want to edit?")
        .setRequired(true)
        .setAutocomplete(true)))
        .addSubcommand((cmd) => cmd
        .setName("delete")
        .setDescription("Delete an existing group")
        .addStringOption((opt) => opt
        .setName("group")
        .setDescription("Which group do you want to delete?")
        .setRequired(true)
        .setAutocomplete(true))),
    async autocomplete(client, interaction) {
        if (!interaction.guildId)
            return;
        const focused = interaction.options.getFocused(true).name;
        if (focused === "group") {
            const focusedValue = interaction.options.getString("group", true);
            const groups = await (0, getServer_1.getServerGroups)(interaction.guildId);
            if (!groups.length) {
                interaction.respond([
                    {
                        name: "You don't have any groups!",
                        value: "",
                    },
                ]);
                return;
            }
            const filtered = groups.filter((m) => m.name.toLowerCase().includes(focusedValue.toLowerCase()));
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
            if (!interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing permission"))).discordMsg);
            const document = await GroupCreator_1.GroupCreatorSchema.create({
                guildId: interaction.guildId,
                metadata: {
                    roles: interaction.guild?.roles.cache
                        .filter((r) => r.id != interaction.guildId)
                        .sort((a, b) => b.position - a.position)
                        .map((role) => ({
                        id: role.id,
                        name: role.name,
                        colour: role.hexColor,
                    })),
                },
            });
            (0, updateCache_1.updateCachedData)(`groupCreators:${document._id}`, parseInt(process.env["TTL_GROUP_CREATORS"]), document.toObject());
            interaction.editReply({
                content: (0, lang_1.t)(lang, "GROUP_CREATE_GOTO_LINK", {
                    link: `${process.env["URL_GROUP_CREATOR"]}?id=${document._id}`,
                }),
            });
        }
        else if (subcommand === "edit") {
            if (!interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing permission"))).discordMsg);
            const id = interaction.options.getString("group", true);
            const group = await (0, getServer_1.getServerGroup)(id, interaction.guildId);
            if (!group) {
                const error = (await (0, onError_1.onError)(new Error("Group not found"))).discordMsg;
                interaction.editReply(error);
                return;
            }
            const document = await GroupCreator_1.GroupCreatorSchema.create({
                guildId: interaction.guildId,
                existingGroup: group,
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
                },
            });
            (0, updateCache_1.updateCachedData)(`groupCreators:${document._id}`, parseInt(process.env["TTL_GROUP_CREATORS"]), document.toObject());
            interaction.editReply({
                content: (0, lang_1.t)(lang, "GROUP_CREATE_GOTO_LINK", {
                    link: `${process.env["URL_GROUP_CREATOR"]}?id=${document._id}`,
                }),
            });
        }
        else if (subcommand === "delete") {
            if (!interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing permission"))).discordMsg);
            const id = interaction.options.getString("group", true);
            const group = await (0, getServer_1.getServerGroup)(id, interaction.guildId);
            if (!group) {
                const error = (await (0, onError_1.onError)(new Error("Group not found"))).discordMsg;
                interaction.editReply(error);
                return;
            }
            await Guild_1.GroupSchema.findOneAndDelete({ _id: id });
            await (0, invalidateCache_1.invalidateCache)(`groups:${interaction.guildId}`);
            await (0, invalidateCache_1.invalidateCache)(`group:${id}`);
            interaction.editReply({
                content: (0, lang_1.t)(lang, "GROUP_DELETED"),
            });
        }
    },
};
exports.default = cmd;
//# sourceMappingURL=/src/commands/interactions/slash/groups.js.map
//# debugId=83365e4b-7b6a-5cb4-8f06-06ff01693752
