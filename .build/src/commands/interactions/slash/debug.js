"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="1fbdaa6c-5f92-5425-911e-8bace5c51c75")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const calculateUserPermissions_1 = require("../../../utils/calculateUserPermissions");
const getServer_1 = require("../../../utils/bot/getServer");
const colours_1 = __importDefault(require("../../../constants/colours"));
const lang_1 = require("../../../lang");
const __1 = require("../../..");
const close_1 = require("../../../utils/tickets/close");
const invalidateCache_1 = require("../../../utils/database/invalidateCache");
const duration_1 = require("../../../utils/formatters/duration");
const command = {
    type: "slash",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("debug")
        .setDescription("Threaded debugger")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageMessages)
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .addSubcommand((cmd) => cmd
        .setName("group_permissions")
        .setDescription("Debug your group permissions")
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .addUserOption((opt) => opt.setName("user").setDescription("The user to check")))
        .addSubcommand((cmd) => cmd
        .setName("close_all_tickets")
        .setDescription("If a user is having problems, close ALL their tickets")
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .addUserOption((opt) => opt
        .setName("user")
        .setDescription("The user to check")
        .setRequired(true))),
    async execute(client, data, interaction) {
        if (!interaction.guildId)
            return;
        await interaction.reply({
            content: (0, lang_1.t)(data.lang, "THINK"),
            flags: [discord_js_1.MessageFlags.Ephemeral],
        });
        const subcommand = interaction.options.getSubcommand(true);
        if (subcommand === "group_permissions") {
            const member = interaction.options.getMember("user") || interaction.member;
            const permissions = (0, calculateUserPermissions_1.getUserPermissions)(member, await (0, getServer_1.getServerGroups)(interaction.guildId));
            interaction.editReply({
                embeds: [
                    {
                        color: parseInt(colours_1.default.info, 16),
                        title: (0, lang_1.t)(data.lang, "DEBUGGER_GROUP_PERMISSIONS_TITLE"),
                        description: (0, lang_1.t)(data.lang, "DEBUGGER_GROUP_PERMISSIONS_BODY"),
                    },
                    {
                        color: parseInt(colours_1.default.info, 16),
                        description: `\`\`\`json\n${JSON.stringify(permissions, (_, v) => (typeof v === "bigint" ? v.toString() : v), 2)}\n\`\`\``,
                    },
                ],
            });
        }
        else if (subcommand === "close_all_tickets") {
            const start = new Date().getTime();
            const user = interaction.options.getUser("user", true);
            await (0, invalidateCache_1.invalidateCache)(`tickets:${interaction.guildId}:${user.id}:Locked|Open`);
            const userTickets = await (0, getServer_1.getUserTickets)(interaction.guildId, user.id, [
                "Open",
                "Locked",
            ]);
            let failed = userTickets.length;
            interaction.editReply({
                content: (0, lang_1.t)(data.lang, "CLOSE_MASS_ACTION", {
                    number: userTickets.length,
                    user: `<@${user.id}>`,
                }),
            });
            for (const ticket of userTickets) {
                const a = await __1.massCloseManager.wrap(async () => {
                    const userPermissions = (0, calculateUserPermissions_1.getUserPermissions)(interaction.member, await (0, getServer_1.getServerGroupsByIds)(ticket.groups, interaction.guildId));
                    if (!userPermissions.tickets.canClose &&
                        !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
                        return false;
                    await (0, close_1.closeTicket)(ticket._id, data.lang);
                    return true;
                }, interaction.guildId);
                if (a)
                    failed--;
            }
            interaction.editReply({
                content: (0, lang_1.t)(data.lang, "CLOSE_MASS_ACTION_DONE", {
                    number: userTickets.length - failed,
                    user: `<@${user.id}>`,
                    failed: failed,
                    duration: (0, duration_1.formatDuration)(new Date().getTime() - start),
                }),
            });
        }
    },
};
exports.default = command;
//# sourceMappingURL=debug.js.map
//# debugId=1fbdaa6c-5f92-5425-911e-8bace5c51c75
