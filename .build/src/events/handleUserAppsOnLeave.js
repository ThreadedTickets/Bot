"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="adaf49f0-0fa4-5be6-94f7-9d2e8a506e38")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const colours_1 = __importDefault(require("../constants/colours"));
const lang_1 = require("../lang");
const fetchMessage_1 = require("../utils/bot/fetchMessage");
const getServer_1 = require("../utils/bot/getServer");
const sendLogToWebhook_1 = require("../utils/bot/sendLogToWebhook");
const invalidateCache_1 = require("../utils/database/invalidateCache");
const logger_1 = __importDefault(require("../utils/logger"));
const event = {
    name: "guildMemberRemove",
    execute(client, data, member) {
        __1.guildLeaveQueue.add(() => handleGuildMemberRemove(client, data, member));
    },
};
async function handleGuildMemberRemove(client, data, member) {
    logger_1.default.debug(`Detected guild member remove ${member.user.username} - running application on leave`);
    const serverApplications = await (0, getServer_1.getServerApplications)(member.guild.id);
    let counters = {
        delete: 0,
        approve: 0,
        reject: 0,
        nothing: 0,
    };
    for (const app of serverApplications) {
        if (app.actionOnUserLeave === "nothing") {
            counters.nothing++;
            continue;
        }
        const userCompleted = await (0, getServer_1.getUserCompletedApplications)(app._id, member.id, ["Pending"]);
        for (const attempt of userCompleted) {
            const server = await (0, getServer_1.getServer)(member.guild.id);
            if (app.actionOnUserLeave === "delete") {
                counters.delete++;
                await attempt.deleteOne();
                await (0, invalidateCache_1.invalidateCache)(`completedApps:${app._id}:Pending`);
                await (0, invalidateCache_1.invalidateCache)(`completedApps:${app._id}:${member.id}:all`);
                await (0, invalidateCache_1.invalidateCache)(`completedApps:${app._id}:${member.id}:Pending`);
                if (attempt.messageLink) {
                    const message = await (0, fetchMessage_1.fetchMessageFromUrl)(client, attempt.messageLink);
                    if (message) {
                        await message.delete().catch(() => { });
                        if (message.hasThread)
                            await message.thread?.delete().catch(() => { });
                    }
                }
                const logChannel = (0, sendLogToWebhook_1.getAvailableLogChannel)(server.settings.logging, "applications.delete");
                if (logChannel) {
                    await (0, sendLogToWebhook_1.postLogToWebhook)(client, {
                        channel: logChannel.channel,
                        enabled: logChannel.enabled,
                        webhook: logChannel.webhook,
                    }, {
                        embeds: [
                            {
                                color: parseInt(colours_1.default.info, 16),
                                title: (0, lang_1.t)(server.preferredLanguage, "DELETE_APPLICATION_LOG_TITLE"),
                                description: (0, lang_1.t)(server.preferredLanguage, "DELETE_APPLICATION_LOG_BODY", {
                                    user: `<@${member.id}>`,
                                    staff: `<@${client.user.id}>`,
                                }),
                            },
                        ],
                    });
                }
            }
            if (app.actionOnUserLeave === "approve") {
                counters.approve++;
                await attempt.updateOne({ status: "Accepted", closedAt: new Date() });
                await (0, invalidateCache_1.invalidateCache)(`completedApps:${app._id}:Pending`);
                await (0, invalidateCache_1.invalidateCache)(`completedApps:${app._id}:${member.id}:all`);
                await (0, invalidateCache_1.invalidateCache)(`completedApps:${app._id}:${member.id}:Pending`);
                if (attempt.messageLink) {
                    const message = await (0, fetchMessage_1.fetchMessageFromUrl)(client, attempt.messageLink);
                    if (message) {
                        await message
                            .edit({
                            components: [],
                            content: (0, lang_1.t)(server.preferredLanguage, "APPLICATION_VERDICT_ACCEPT_HEADER", {
                                user: `<@${client.user.id}>`,
                                reason: (0, lang_1.t)(server.preferredLanguage, "LEFT_SERVER"),
                            }),
                        })
                            .catch(() => { });
                        if (message.hasThread)
                            await message.thread?.setArchived().catch(() => { });
                    }
                }
                const logChannel = (0, sendLogToWebhook_1.getAvailableLogChannel)(server.settings.logging, "applications.approve");
                if (logChannel) {
                    await (0, sendLogToWebhook_1.postLogToWebhook)(client, {
                        channel: logChannel.channel,
                        enabled: logChannel.enabled,
                        webhook: logChannel.webhook,
                    }, {
                        embeds: [
                            {
                                color: parseInt(colours_1.default.info, 16),
                                title: (0, lang_1.t)(server.preferredLanguage, "APPROVE_APPLICATION_LOG_TITLE"),
                                description: (0, lang_1.t)(server.preferredLanguage, "APPROVE_APPLICATION_LOG_BODY", {
                                    user: `<@${member.id}>`,
                                    staff: `<@${client.user.id}>`,
                                }),
                            },
                        ],
                    });
                }
            }
            if (app.actionOnUserLeave === "reject") {
                counters.reject++;
                await attempt.updateOne({ status: "Rejected", closedAt: new Date() });
                await (0, invalidateCache_1.invalidateCache)(`completedApps:${app._id}:Pending`);
                await (0, invalidateCache_1.invalidateCache)(`completedApps:${app._id}:${member.id}:all`);
                await (0, invalidateCache_1.invalidateCache)(`completedApps:${app._id}:${member.id}:Pending`);
                if (attempt.messageLink) {
                    const message = await (0, fetchMessage_1.fetchMessageFromUrl)(client, attempt.messageLink);
                    if (message) {
                        await message
                            .edit({
                            components: [],
                            content: (0, lang_1.t)(server.preferredLanguage, "APPLICATION_VERDICT_REJECT_HEADER", {
                                user: `<@${client.user.id}>`,
                                reason: (0, lang_1.t)(server.preferredLanguage, "LEFT_SERVER"),
                            }),
                        })
                            .catch(() => { });
                        if (message.hasThread)
                            await message.thread?.setArchived().catch(() => { });
                    }
                }
                const logChannel = (0, sendLogToWebhook_1.getAvailableLogChannel)(server.settings.logging, "applications.reject");
                if (logChannel) {
                    await (0, sendLogToWebhook_1.postLogToWebhook)(client, {
                        channel: logChannel.channel,
                        enabled: logChannel.enabled,
                        webhook: logChannel.webhook,
                    }, {
                        embeds: [
                            {
                                color: parseInt(colours_1.default.info, 16),
                                title: (0, lang_1.t)(server.preferredLanguage, "REJECT_APPLICATION_LOG_TITLE"),
                                description: (0, lang_1.t)(server.preferredLanguage, "REJECT_APPLICATION_LOG_BODY", {
                                    user: `<@${member.id}>`,
                                    staff: `<@${client.user.id}>`,
                                }),
                            },
                        ],
                    });
                }
            }
            await (0, __1.wait)(250);
        }
    }
    logger_1.default.debug(`Finished processing guild member leave event: ${counters.nothing} nothing | ${counters.approve} approved | ${counters.reject} rejected | ${counters.delete} deleted`);
}
exports.default = event;
//# sourceMappingURL=/src/events/handleUserAppsOnLeave.js.map
//# debugId=adaf49f0-0fa4-5be6-94f7-9d2e8a506e38
