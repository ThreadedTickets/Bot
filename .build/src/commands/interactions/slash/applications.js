"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="5f3d1ea7-11f9-5d94-a40b-c3e0ccf75790")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const getServer_1 = require("../../../utils/bot/getServer");
const calculateUserPermissions_1 = require("../../../utils/calculateUserPermissions");
const lang_1 = require("../../../lang");
const onError_1 = require("../../../utils/onError");
const ApplicationCreator_1 = require("../../../database/modals/ApplicationCreator");
const updateCache_1 = require("../../../utils/database/updateCache");
const Panel_1 = require("../../../database/modals/Panel");
const CompletedApplications_1 = require("../../../database/modals/CompletedApplications");
const invalidateCache_1 = require("../../../utils/database/invalidateCache");
const cmd = {
    type: "slash",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("applications")
        .setDescription("Application configuration base")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageGuild)
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .addSubcommand((cmd) => cmd.setName("new").setDescription("Create a new application"))
        .addSubcommand((cmd) => cmd
        .setName("edit")
        .setDescription("Edit an existing application")
        .addStringOption((opt) => opt
        .setName("application")
        .setDescription("Which application do you want to edit?")
        .setRequired(true)
        .setAutocomplete(true)))
        .addSubcommand((cmd) => cmd
        .setName("delete")
        .setDescription("Delete an existing application")
        .addStringOption((opt) => opt
        .setName("application")
        .setDescription("Which application do you want to delete?")
        .setRequired(true)
        .setAutocomplete(true))),
    async autocomplete(client, interaction) {
        if (!interaction.guildId)
            return;
        const focused = interaction.options.getFocused(true).name;
        if (focused === "application") {
            const focusedValue = interaction.options.getString("application", true);
            const applications = await (0, getServer_1.getServerApplications)(interaction.guildId);
            if (!applications.length) {
                interaction.respond([
                    {
                        name: "You don't have any applications!",
                        value: "",
                    },
                ]);
                return;
            }
            const filtered = applications.filter((m) => m.name.toLowerCase().includes(focusedValue.toLowerCase()));
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
            if (!userPermissions.applications.manage &&
                !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing manage permission"))).discordMsg);
            const document = await ApplicationCreator_1.ApplicationCreatorSchema.create({
                guildId: interaction.guildId,
                metadata: {
                    roles: interaction.guild?.roles.cache
                        .filter((r) => r.id != interaction.guildId)
                        .sort((a, b) => b.position - a.position)
                        .map((role) => ({
                        value: role.id,
                        label: role.name,
                    })),
                    channels: interaction.guild?.channels.cache
                        .filter((r) => r.id != interaction.guildId && r.isTextBased())
                        .map((role) => ({
                        value: role.id,
                        label: role.name,
                    })),
                    messages: (await (0, getServer_1.getServerMessages)(interaction.guildId)).map((role) => ({
                        value: role._id,
                        label: role.name,
                    })),
                    groups: (await (0, getServer_1.getServerGroups)(interaction.guildId)).map((role) => ({
                        value: role._id,
                        label: role.name,
                    })),
                    ticketTriggers: (await (0, getServer_1.getServerTicketTriggers)(interaction.guildId)).map((role) => ({
                        value: role._id,
                        label: role.label,
                    })),
                },
            });
            (0, updateCache_1.updateCachedData)(`applicationCreators:${document._id}`, parseInt(process.env["TTL_APPLICATION_CREATORS"]), document.toObject());
            interaction.editReply({
                content: (0, lang_1.t)(lang, "APPLICATION_CREATE_GOTO_LINK", {
                    link: `${process.env["URL_APPLICATION_CREATOR"]}?id=${document._id}`,
                }),
            });
        }
        else if (subcommand === "edit") {
            if (!userPermissions.applications.manage &&
                !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing manage permission"))).discordMsg);
            const id = interaction.options.getString("application", true);
            const application = await (0, getServer_1.getServerApplication)(id, interaction.guildId);
            if (!application) {
                const error = (await (0, onError_1.onError)(new Error("Application not found")))
                    .discordMsg;
                interaction.editReply(error);
                return;
            }
            const document = await ApplicationCreator_1.ApplicationCreatorSchema.create({
                guildId: interaction.guildId,
                existingApplication: application,
                metadata: {
                    link: id,
                    roles: interaction.guild?.roles.cache
                        .filter((r) => r.id != interaction.guildId)
                        .sort((a, b) => b.position - a.position)
                        .map((role) => ({
                        value: role.id,
                        label: role.name,
                    })),
                    channels: interaction.guild?.channels.cache
                        .filter((r) => r.id != interaction.guildId && r.isTextBased())
                        .map((role) => ({
                        value: role.id,
                        label: role.name,
                    })),
                    messages: (await (0, getServer_1.getServerMessages)(interaction.guildId)).map((role) => ({
                        value: role._id,
                        label: role.name,
                    })),
                    groups: (await (0, getServer_1.getServerGroups)(interaction.guildId)).map((role) => ({
                        value: role._id,
                        label: role.name,
                    })),
                    ticketTriggers: (await (0, getServer_1.getServerTicketTriggers)(interaction.guildId)).map((role) => ({
                        value: role._id,
                        label: role.label,
                    })),
                },
            });
            (0, updateCache_1.updateCachedData)(`applicationCreators:${document._id}`, parseInt(process.env["TTL_APPLICATION_CREATORS"]), document.toObject());
            interaction.editReply({
                content: (0, lang_1.t)(lang, "APPLICATION_CREATE_GOTO_LINK", {
                    link: `${process.env["URL_APPLICATION_CREATOR"]}?id=${document._id}`,
                }),
            });
        }
        else if (subcommand === "delete") {
            if (!userPermissions.applications.manage &&
                !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing manage permission"))).discordMsg);
            const id = interaction.options.getString("application", true);
            const application = await (0, getServer_1.getServerApplication)(id, interaction.guildId);
            if (!application) {
                const error = (await (0, onError_1.onError)(new Error("Application not found")))
                    .discordMsg;
                interaction.editReply(error);
                return;
            }
            // creators will just let themselves expire
            await Panel_1.ApplicationTriggerSchema.findOneAndDelete({ _id: id });
            await CompletedApplications_1.CompletedApplicationSchema.deleteMany({
                application: id,
            });
            await (0, invalidateCache_1.invalidateCache)(`applications:${interaction.guildId}`);
            await (0, invalidateCache_1.invalidateCache)(`application:${id}`);
            interaction.editReply({
                content: (0, lang_1.t)(lang, "APPLICATION_DELETED"),
            });
        }
    },
};
exports.default = cmd;
//# sourceMappingURL=applications.js.map
//# debugId=5f3d1ea7-11f9-5d94-a40b-c3e0ccf75790
