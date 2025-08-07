"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="21452c50-9920-5e36-8e52-83acb283f5bc")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const getServer_1 = require("../../../utils/bot/getServer");
const lang_1 = require("../../../lang");
const calculateUserPermissions_1 = require("../../../utils/calculateUserPermissions");
const onError_1 = require("../../../utils/onError");
const TicketTriggerCreator_1 = require("../../../database/modals/TicketTriggerCreator");
const updateCache_1 = require("../../../utils/database/updateCache");
const Panel_1 = require("../../../database/modals/Panel");
const invalidateCache_1 = require("../../../utils/database/invalidateCache");
const cmd = {
    type: "slash",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("ticket_triggers")
        .setDescription("Ticket trigger configuration base")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageGuild)
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .addSubcommand((cmd) => cmd.setName("new").setDescription("Create a new ticket trigger"))
        .addSubcommand((cmd) => cmd
        .setName("edit")
        .setDescription("Edit an existing ticket trigger")
        .addStringOption((opt) => opt
        .setName("ticket_trigger")
        .setDescription("Which ticket trigger do you want to edit?")
        .setRequired(true)
        .setAutocomplete(true)))
        .addSubcommand((cmd) => cmd
        .setName("delete")
        .setDescription("Delete an existing ticket trigger")
        .addStringOption((opt) => opt
        .setName("ticket_trigger")
        .setDescription("Which ticket trigger do you want to delete?")
        .setRequired(true)
        .setAutocomplete(true))),
    async autocomplete(client, interaction) {
        if (!interaction.guildId)
            return;
        const focused = interaction.options.getFocused(true).name;
        if (focused === "ticket_trigger") {
            const focusedValue = interaction.options.getString("ticket_trigger", true);
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
        const subcommand = interaction.options.getSubcommand(true);
        const lang = data.lang;
        await interaction.reply({
            content: (0, lang_1.t)(data.lang, "THINK"),
            flags: [discord_js_1.MessageFlags.Ephemeral],
        });
        const groups = await (0, getServer_1.getServerGroups)(interaction.guildId);
        const userPermissions = (0, calculateUserPermissions_1.getUserPermissions)(interaction.member, groups);
        if (subcommand === "new") {
            if (!userPermissions.panels.manage &&
                !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing manage permission"))).discordMsg);
            const document = await TicketTriggerCreator_1.TicketTriggerCreatorSchema.create({
                guildId: interaction.guildId,
                metadata: {
                    roles: interaction.guild?.roles.cache
                        .filter((r) => r.id != interaction.guildId)
                        .sort((a, b) => b.position - a.position)
                        .map((role) => ({
                        value: role.id,
                        label: role.name,
                    })),
                    textChannels: interaction.guild?.channels.cache
                        .filter((r) => r.id != interaction.guildId && r.isTextBased())
                        .map((role) => ({
                        value: role.id,
                        label: role.name,
                    })),
                    categories: interaction.guild?.channels.cache
                        .filter((r) => r.id != interaction.guildId &&
                        r.type === discord_js_1.ChannelType.GuildCategory)
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
                },
            });
            (0, updateCache_1.updateCachedData)(`ticketTriggerCreators:${document._id}`, parseInt(process.env["TTL_TICKET_TRIGGER_CREATORS"]), document.toObject());
            interaction.editReply({
                content: (0, lang_1.t)(lang, "TICKET_TRIGGER_CREATE_GOTO_LINK", {
                    link: `${process.env["URL_TICKET_TRIGGER_CREATOR"]}?id=${document._id}`,
                }),
            });
        }
        else if (subcommand === "edit") {
            if (!userPermissions.panels.manage &&
                !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing manage permission"))).discordMsg);
            const id = interaction.options.getString("ticket_trigger", true);
            const trigger = await (0, getServer_1.getServerTicketTrigger)(id, interaction.guildId);
            if (!trigger) {
                const error = (await (0, onError_1.onError)(new Error("Trigger not found")))
                    .discordMsg;
                interaction.editReply(error);
                return;
            }
            const document = await TicketTriggerCreator_1.TicketTriggerCreatorSchema.create({
                guildId: interaction.guildId,
                existingTrigger: trigger,
                metadata: {
                    link: id,
                    roles: interaction.guild?.roles.cache
                        .filter((r) => r.id != interaction.guildId)
                        .sort((a, b) => b.position - a.position)
                        .map((role) => ({
                        value: role.id,
                        label: role.name,
                    })),
                    textChannels: interaction.guild?.channels.cache
                        .filter((r) => r.id != interaction.guildId && r.isTextBased())
                        .map((role) => ({
                        value: role.id,
                        label: role.name,
                    })),
                    categories: interaction.guild?.channels.cache
                        .filter((r) => r.id != interaction.guildId &&
                        r.type === discord_js_1.ChannelType.GuildCategory)
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
                },
            });
            (0, updateCache_1.updateCachedData)(`ticketTriggerCreators:${document._id}`, parseInt(process.env["TTL_TICKET_TRIGGER_CREATORS"]), document.toObject());
            interaction.editReply({
                content: (0, lang_1.t)(lang, "TICKET_TRIGGER_CREATE_GOTO_LINK", {
                    link: `${process.env["URL_TICKET_TRIGGER_CREATOR"]}?id=${document._id}`,
                }),
            });
        }
        else if (subcommand === "delete") {
            if (!userPermissions.panels.manage &&
                !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                return interaction.editReply((await (0, onError_1.onError)(new Error("Missing manage permission"))).discordMsg);
            const id = interaction.options.getString("ticket_trigger", true);
            const trigger = await (0, getServer_1.getServerTicketTrigger)(id, interaction.guildId);
            if (!trigger) {
                const error = (await (0, onError_1.onError)(new Error("Trigger not found")))
                    .discordMsg;
                interaction.editReply(error);
                return;
            }
            await Panel_1.TicketTriggerSchema.findOneAndDelete({ _id: id });
            await (0, invalidateCache_1.invalidateCache)(`ticketTriggers:${interaction.guildId}`);
            await (0, invalidateCache_1.invalidateCache)(`ticketTrigger:${id}`);
            interaction.editReply({
                content: (0, lang_1.t)(lang, "TICKET_TRIGGER_DELETED"),
            });
        }
    },
};
exports.default = cmd;
//# sourceMappingURL=triggers.js.map
//# debugId=21452c50-9920-5e36-8e52-83acb283f5bc
