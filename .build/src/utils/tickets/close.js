"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="89186802-e281-50a6-9451-93722a0246d4")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeTicket = closeTicket;
const discord_js_1 = require("discord.js");
const __1 = require("../..");
const duration_1 = require("../formatters/duration");
const lang_1 = require("../../lang");
const Ticket_1 = require("../../database/modals/Ticket");
const getServer_1 = require("../bot/getServer");
const sendLogToWebhook_1 = require("../bot/sendLogToWebhook");
const colours_1 = __importDefault(require("../../constants/colours"));
const fetchMessage_1 = require("../bot/fetchMessage");
const TicketChannelManager_1 = require("../bot/TicketChannelManager");
const onError_1 = require("../onError");
const invalidateCache_1 = require("../database/invalidateCache");
const main_1 = require("../hooks/events/tickets/new/main");
const ticketOwnerPermissionsClosed_1 = __importDefault(require("../../constants/ticketOwnerPermissionsClosed"));
const everyoneTicketPermissions_1 = __importDefault(require("../../constants/everyoneTicketPermissions"));
const botTicketPermissions_1 = __importDefault(require("../../constants/botTicketPermissions"));
const roles_1 = require("../hooks/events/applications/end/roles");
const getGuildMember_1 = require("../bot/getGuildMember");
const TranscriptManager_1 = require("./TranscriptManager");
const render_1 = require("./render");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const serverMessageToDiscordMessage_1 = __importDefault(require("../formatters/serverMessageToDiscordMessage"));
const resolvePlaceholders_1 = require("../message/placeholders/resolvePlaceholders");
const generateBaseContext_1 = require("../message/placeholders/generateBaseContext");
const logger_1 = __importDefault(require("../logger"));
const config_1 = __importDefault(require("../../config"));
async function closeTicket(ticketId, locale, reason, repliable, schedule) {
    const ticket = await Ticket_1.TicketSchema.findOneAndUpdate({ _id: ticketId }, {
        status: "Closed",
        deletedAt: new Date(),
        closeReason: reason || "No reason provided",
    }, {
        new: false,
    });
    await (0, invalidateCache_1.invalidateCache)(`ticket:${ticketId}`);
    if (!ticket)
        return "editReply" in repliable
            ? repliable?.editReply((await (0, onError_1.onError)(new Error("Could not find ticket"), {
                ticketId: ticketId,
            })).discordMsg)
            : repliable?.edit((await (0, onError_1.onError)(new Error("Could not find ticket"), {
                ticketId: ticketId,
            })).discordMsg);
    if (ticket.status === "Closed" && repliable)
        return "editReply" in repliable
            ? repliable?.editReply((0, lang_1.t)(locale, "SCHEDULE_TICKET_CLOSE_ALREADY"))
            : repliable?.edit((0, lang_1.t)(locale, "SCHEDULE_TICKET_CLOSE_ALREADY"));
    if (repliable) {
        const member = await (0, getGuildMember_1.getGuildMember)(__1.client, ticket.server, ticket.owner);
        if (member)
            (0, roles_1.updateMemberRoles)(__1.client, member, ticket.addRolesOnClose, ticket.removeRolesOnClose);
    }
    const ticketChannel = await (0, fetchMessage_1.fetchChannelById)(__1.client, ticket.channel);
    const server = await (0, getServer_1.getServer)(ticket.server);
    if (schedule) {
        const logChannel = (0, sendLogToWebhook_1.getAvailableLogChannel)(server.settings.logging, "tickets.close");
        if (logChannel)
            await (0, sendLogToWebhook_1.postLogToWebhook)(__1.client, {
                channel: logChannel.channel,
                enabled: logChannel.enabled,
                webhook: logChannel.webhook,
            }, {
                embeds: [
                    {
                        color: parseInt(colours_1.default.info, 16),
                        title: (0, lang_1.t)(server.preferredLanguage, "TICKET_CLOSE_LOG_TITLE"),
                        description: (0, lang_1.t)(server.preferredLanguage, `TICKET_CLOSE_LOG_BODY`, {
                            user: `<@${ticket.owner}>`,
                            id: ticketId,
                            reason: reason || "No reason provided",
                        }),
                    },
                ],
            });
        if (!ticketChannel?.isThread()) {
            await ticketChannel
                .edit({
                permissionOverwrites: (0, main_1.buildChannelPermissionOverwrites)(await (0, getServer_1.getServerGroupsByIds)(ticket.groups, ticket.server), ticket.server, { id: ticket.owner, ...ticketOwnerPermissionsClosed_1.default }, everyoneTicketPermissions_1.default, { id: __1.client.user.id, ...botTicketPermissions_1.default }),
                ...(ticket.closeChannel ? { parent: ticket.closeChannel } : {}),
            })
                .catch((err) => logger_1.default.warn(`Failed to edit ticket channel on close`, err));
        }
        const ms = (0, duration_1.parseDurationToMs)(schedule);
        const formattedDuration = (0, duration_1.formatDuration)(ms);
        __1.TaskScheduler.scheduleTask("closeTicket", { ticketId, locale, reason }, ms, `CLOSE-${ticketId}`);
        "editReply" in repliable
            ? repliable?.editReply((0, lang_1.t)(locale, "SCHEDULE_TICKET_CLOSE", { duration: formattedDuration }))
            : repliable?.edit((0, lang_1.t)(locale, "SCHEDULE_TICKET_CLOSE", { duration: formattedDuration }));
        if (ticketChannel?.isTextBased())
            ticketChannel
                .send({
                content: (0, lang_1.t)(locale, "TICKET_CLOSE_REOPEN_MESSAGE", {
                    duration: formattedDuration,
                }),
                components: [
                    new discord_js_1.ActionRowBuilder().setComponents(new discord_js_1.ButtonBuilder()
                        .setCustomId(`reopen:${ticketId}`)
                        .setStyle(discord_js_1.ButtonStyle.Primary)
                        .setLabel((0, lang_1.t)(locale, "TICKET_PIN_MESSAGE_COMPONENTS_REOPEN"))
                        .setDisabled(!ticket.allowReopening)),
                ],
            })
                .catch((err) => logger_1.default.warn(`Failed to send message to ticket channel on close`, err));
        else if (ticketChannel?.isThread()) {
            await ticketChannel.members
                .remove(ticket.owner)
                .catch((err) => logger_1.default.warn(`Failed to remove ticket owner on close`, err));
        }
        return;
    }
    if (ticket.takeTranscripts) {
        const writer = new TranscriptManager_1.TranscriptWriter(ticketId);
        writer.setMeta("name", ticketId);
        const html = await (0, render_1.renderTranscriptFromJsonl)(writer.getFilePath(), writer.getMeta().users, writer.getMeta().metadata);
        const transcriptPath = path_1.default.join(process.cwd(), "transcripts", `${ticket.isRaised ? "LOCKED_" : ""}${ticketId}.html`);
        fs_1.default.writeFileSync(transcriptPath, html);
        writer.deleteTranscript();
        const logChannel = (0, sendLogToWebhook_1.getAvailableLogChannel)(server.settings.logging, "tickets.transcripts");
        if (logChannel)
            await (0, sendLogToWebhook_1.postLogToWebhook)(__1.client, {
                channel: logChannel.channel,
                enabled: logChannel.enabled,
                webhook: logChannel.webhook,
            }, {
                embeds: [
                    {
                        color: parseInt(colours_1.default.info, 16),
                        title: (0, lang_1.t)(server.preferredLanguage, "TICKET_CLOSE_WITH_TRANSCRIPT_LOG_TITLE"),
                        description: (0, lang_1.t)(server.preferredLanguage, `TICKET_CLOSE_WITH_TRANSCRIPT_LOG_BODY`, {
                            user: `<@${ticket.owner}>`,
                            id: ticketId,
                            reason: reason || "No reason provided",
                        }),
                    },
                ],
                files: [transcriptPath],
            });
    }
    await new TicketChannelManager_1.TicketChannelManager().remove(ticket.channel);
    (0, invalidateCache_1.invalidateCache)(`tickets:${ticket.server}:${ticket.owner}:Open`);
    (0, invalidateCache_1.invalidateCache)(`tickets:${ticket.server}:Open`);
    if (ticketChannel) {
        await ticketChannel
            .delete("Deleting old ticket channel")
            .catch((err) => logger_1.default.warn(`Failed to delete ticket channel on close`, err));
    }
    if (ticket.dmOnClose) {
        const owner = await (0, getGuildMember_1.getGuildMember)(__1.client, ticket.server, ticket.owner);
        const message = await (0, getServer_1.getServerMessage)(ticket.dmOnClose, ticket.server);
        const guild = await (0, fetchMessage_1.fetchGuildById)(__1.client, ticket.server);
        if (owner && message && guild) {
            owner.send({
                components: config_1.default.isWhiteLabel
                    ? []
                    : [
                        new discord_js_1.ActionRowBuilder()
                            .addComponents(new discord_js_1.ButtonBuilder()
                            .setURL(process.env["DISCORD_APPLICATION_INVITE"])
                            .setStyle(discord_js_1.ButtonStyle.Link)
                            .setLabel((0, lang_1.t)(locale, "TICKET_CLOSE_DM_BUTTON")))
                            .toJSON(),
                    ],
                ...(0, resolvePlaceholders_1.resolveDiscordMessagePlaceholders)((0, serverMessageToDiscordMessage_1.default)(message), (0, generateBaseContext_1.generateBasePlaceholderContext)({
                    server: guild,
                })),
            });
        }
    }
}
//# sourceMappingURL=/src/utils/tickets/close.js.map
//# debugId=89186802-e281-50a6-9451-93722a0246d4
