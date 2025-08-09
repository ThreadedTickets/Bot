"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="94fdf3ac-7c4e-5133-92a3-9ffef88af7c6")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lang_1 = require("../../lang");
const getServer_1 = require("../../utils/bot/getServer");
const onError_1 = require("../../utils/onError");
const invalidateCache_1 = require("../../utils/database/invalidateCache");
const sendLogToWebhook_1 = require("../../utils/bot/sendLogToWebhook");
const colours_1 = __importDefault(require("../../constants/colours"));
const getGuildMember_1 = require("../../utils/bot/getGuildMember");
const roles_1 = require("../../utils/hooks/events/applications/end/roles");
const CompletedApplications_1 = require("../../database/modals/CompletedApplications");
const calculateUserPermissions_1 = require("../../utils/calculateUserPermissions");
const discord_js_1 = require("discord.js");
const button = {
    customId: "delApp",
    async execute(client, data, interaction) {
        if (!interaction.guildId)
            return;
        const [, applicationId, owner] = interaction.customId.split(":");
        const application = await (0, getServer_1.getCompletedApplication)(applicationId, owner);
        if (!application)
            return interaction.reply((await (0, onError_1.onError)(new Error("Application attempt not found"))).discordMsg);
        if (application.status !== "Pending")
            return interaction.reply((await (0, onError_1.onError)(new Error("Application already responded"))).discordMsg);
        const applicationTrigger = await (0, getServer_1.getServerApplication)(application.application, interaction.guildId);
        if (!applicationTrigger)
            return interaction.reply((await (0, onError_1.onError)(new Error("Application not found"))).discordMsg);
        const userPermissions = (0, calculateUserPermissions_1.getUserPermissions)(interaction.member, await (0, getServer_1.getServerGroupsByIds)(applicationTrigger.groups, interaction.guildId));
        if (!userPermissions.applications.respond &&
            !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
            return interaction.reply((await (0, onError_1.onError)(new Error("Missing respond permission"))).discordMsg);
        const server = await (0, getServer_1.getServer)(interaction.guildId);
        await interaction.deferUpdate();
        interaction.message.delete().catch(() => { });
        if (interaction.message.hasThread)
            interaction.message.thread?.delete().catch(() => { });
        await (0, invalidateCache_1.invalidateCache)(`completedApps:${applicationTrigger._id}:Pending`);
        await (0, invalidateCache_1.invalidateCache)(`completedApps:${applicationTrigger._id}:${owner}:all`);
        await CompletedApplications_1.CompletedApplicationSchema.findOneAndDelete({ _id: applicationId });
        const member = await (0, getGuildMember_1.getGuildMember)(client, interaction.guildId, application.owner);
        if (member && applicationTrigger) {
            await (0, roles_1.updateMemberRoles)(client, member, applicationTrigger.removeRolesWhenPending, applicationTrigger.addRolesWhenPending);
        }
        const logChannel = (0, sendLogToWebhook_1.getAvailableLogChannel)(server.settings.logging, "applications.delete");
        if (!logChannel)
            return;
        await (0, sendLogToWebhook_1.postLogToWebhook)(client, {
            channel: logChannel.channel,
            enabled: logChannel.enabled,
            webhook: logChannel.webhook,
        }, {
            embeds: [
                {
                    color: parseInt(colours_1.default.info, 16),
                    title: (0, lang_1.t)(server.preferredLanguage, "DELETE_APPLICATION_LOG_TITLE"),
                    description: (0, lang_1.t)(server.preferredLanguage, `DELETE_APPLICATION_LOG_BODY`, {
                        user: `<@${owner}>`,
                        staff: `<@${interaction.user.id}>`,
                    }),
                },
            ],
        });
    },
};
exports.default = button;
//# sourceMappingURL=/src/interactions/buttons/deleteApp.js.map
//# debugId=94fdf3ac-7c4e-5133-92a3-9ffef88af7c6
