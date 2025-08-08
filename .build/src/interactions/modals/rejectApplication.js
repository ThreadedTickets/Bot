"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="06e2aa51-ad60-5685-94ec-4fd4339173fa")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const colours_1 = __importDefault(require("../../constants/colours"));
const CompletedApplications_1 = require("../../database/modals/CompletedApplications");
const lang_1 = require("../../lang");
const getGuildMember_1 = require("../../utils/bot/getGuildMember");
const getServer_1 = require("../../utils/bot/getServer");
const sendDirectMessage_1 = require("../../utils/bot/sendDirectMessage");
const sendLogToWebhook_1 = require("../../utils/bot/sendLogToWebhook");
const invalidateCache_1 = require("../../utils/database/invalidateCache");
const roles_1 = require("../../utils/hooks/events/applications/end/roles");
const generateBaseContext_1 = require("../../utils/message/placeholders/generateBaseContext");
const resolvePlaceholders_1 = require("../../utils/message/placeholders/resolvePlaceholders");
const onError_1 = require("../../utils/onError");
const modal = {
    customId: "rejApp",
    async execute(client, data, interaction) {
        if (!interaction.guildId)
            return;
        const reason = interaction.fields.getTextInputValue("reason") || "None";
        const [, applicationId, owner] = interaction.customId.split(":");
        const application = await (0, getServer_1.getCompletedApplication)(applicationId, owner);
        if (!application)
            return interaction.reply((await (0, onError_1.onError)(new Error("Application not found"))).discordMsg);
        if (application.status !== "Pending")
            return interaction.reply((await (0, onError_1.onError)(new Error("Application already responded"))).discordMsg);
        const server = await (0, getServer_1.getServer)(interaction.guildId);
        await interaction.deferUpdate();
        if (interaction.message.hasThread)
            interaction.message.thread?.setArchived().catch(() => { });
        await CompletedApplications_1.CompletedApplicationSchema.findOneAndUpdate({ _id: applicationId }, { status: "Rejected", closedAt: new Date() });
        const member = await (0, getGuildMember_1.getGuildMember)(client, interaction.guildId, application.owner);
        const applicationTrigger = await (0, getServer_1.getServerApplication)(application.application, interaction.guildId);
        if (member && applicationTrigger) {
            await (0, roles_1.updateMemberRoles)(client, member, [
                ...applicationTrigger.removeRolesWhenPending,
                ...applicationTrigger.addRolesOnReject,
            ], [
                ...applicationTrigger.addRolesWhenPending,
                ...applicationTrigger.removeRolesOnReject,
            ]);
        }
        if (applicationTrigger) {
            await (0, invalidateCache_1.invalidateCache)(`completedApps:${applicationTrigger._id}:Pending`);
            await (0, invalidateCache_1.invalidateCache)(`completedApps:${applicationTrigger._id}:${owner}:all`);
            let baseMessage = {
                embeds: [
                    {
                        color: parseInt(colours_1.default.error, 16),
                        description: (0, lang_1.t)(server.preferredLanguage, "APPLICATION_DEFAULT_MESSAGE_REJECTED", {
                            applicationName: applicationTrigger.name,
                            serverName: interaction.guild.name,
                            reason: reason,
                            reviewer: `<@${interaction.user.id}>`,
                        }),
                    },
                ],
            };
            const customMessage = applicationTrigger.acceptedMessage
                ? await (0, getServer_1.getServerMessage)(applicationTrigger.acceptedMessage, applicationTrigger.server)
                : null;
            if (customMessage) {
                baseMessage = {
                    content: customMessage.content,
                    embeds: customMessage.embeds,
                };
            }
            (0, sendDirectMessage_1.sendDirectMessage)(client, owner, (0, resolvePlaceholders_1.resolveDiscordMessagePlaceholders)(baseMessage, {
                ...(0, generateBaseContext_1.generateBasePlaceholderContext)({
                    server: interaction.guild,
                }),
                applicationName: applicationTrigger.name,
                reason: interaction.guild.name,
                reviewer: `<@${interaction.user.id}>`,
            }));
        }
        interaction
            .message.edit({
            components: [],
            content: (0, lang_1.t)(server.preferredLanguage, "APPLICATION_VERDICT_REJECT_HEADER", { user: `<@${interaction.user.id}>`, reason }),
        })
            .catch(() => { });
        const logChannel = (0, sendLogToWebhook_1.getAvailableLogChannel)(server.settings.logging, "applications.reject");
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
                    title: (0, lang_1.t)(server.preferredLanguage, "REJECT_APPLICATION_LOG_TITLE"),
                    description: (0, lang_1.t)(server.preferredLanguage, `REJECT_APPLICATION_LOG_BODY`, {
                        user: `<@${owner}>`,
                        staff: `<@${interaction.user.id}>`,
                        reason,
                    }),
                },
            ],
        });
    },
};
exports.default = modal;
//# sourceMappingURL=/src/interactions/modals/rejectApplication.js.map
//# debugId=06e2aa51-ad60-5685-94ec-4fd4339173fa
