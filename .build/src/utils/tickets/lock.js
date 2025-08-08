"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="5fcca8f5-1453-5c09-a133-36f4ba991e04")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lockTicket = lockTicket;
const discord_js_1 = require("discord.js");
const __1 = require("../..");
const lang_1 = require("../../lang");
const getServer_1 = require("../bot/getServer");
const sendLogToWebhook_1 = require("../bot/sendLogToWebhook");
const colours_1 = __importDefault(require("../../constants/colours"));
const fetchMessage_1 = require("../bot/fetchMessage");
const onError_1 = require("../onError");
const main_1 = require("../hooks/events/tickets/new/main");
const ticketOwnerPermissionsClosed_1 = __importDefault(require("../../constants/ticketOwnerPermissionsClosed"));
const everyoneTicketPermissions_1 = __importDefault(require("../../constants/everyoneTicketPermissions"));
const botTicketPermissions_1 = __importDefault(require("../../constants/botTicketPermissions"));
const Ticket_1 = require("../../database/modals/Ticket");
const invalidateCache_1 = require("../database/invalidateCache");
const logger_1 = __importDefault(require("../logger"));
async function lockTicket(ticketId, locale, repliable) {
    const ticket = await (0, getServer_1.getTicketTrust)(ticketId);
    if (!ticket)
        return "editReply" in repliable
            ? repliable?.editReply((await (0, onError_1.onError)(new Error("Could not find ticket"), {
                ticketId: ticketId,
            })).discordMsg)
            : repliable?.edit((await (0, onError_1.onError)(new Error("Could not find ticket"), {
                ticketId: ticketId,
            })).discordMsg);
    if (ticket.status === "Closed")
        return "editReply" in repliable
            ? repliable?.editReply((0, lang_1.t)(locale, "TICKET_CLOSED_SO_CANNOT_LOCK"))
            : repliable?.edit((0, lang_1.t)(locale, "TICKET_CLOSED_SO_CANNOT_LOCK"));
    if (ticket.status === "Locked")
        return "editReply" in repliable
            ? repliable?.editReply((0, lang_1.t)(locale, "TICKET_LOCKED_SO_CANNOT_LOCK"))
            : repliable?.edit((0, lang_1.t)(locale, "TICKET_LOCKED_SO_CANNOT_LOCK"));
    await Ticket_1.TicketSchema.findOneAndUpdate({ _id: ticketId }, { status: "Locked" });
    await (0, invalidateCache_1.invalidateCache)(`ticket:${ticketId}`);
    await (0, invalidateCache_1.invalidateCache)(`ticketTrust:${ticketId}`);
    (0, invalidateCache_1.invalidateCache)(`tickets:${ticket.server}:${ticket.owner}:Open`);
    (0, invalidateCache_1.invalidateCache)(`tickets:${ticket.server}:Open`);
    const ticketChannel = await (0, fetchMessage_1.fetchChannelById)(__1.client, ticket.channel);
    const server = await (0, getServer_1.getServer)(ticket.server);
    const logChannel = (0, sendLogToWebhook_1.getAvailableLogChannel)(server.settings.logging, "tickets.lock");
    if (logChannel)
        await (0, sendLogToWebhook_1.postLogToWebhook)(__1.client, {
            channel: logChannel.channel,
            enabled: logChannel.enabled,
            webhook: logChannel.webhook,
        }, {
            embeds: [
                {
                    color: parseInt(colours_1.default.info, 16),
                    title: (0, lang_1.t)(server.preferredLanguage, "TICKET_LOCK_LOG_TITLE"),
                    description: (0, lang_1.t)(server.preferredLanguage, `TICKET_LOCK_LOG_BODY`, {
                        user: `<@${ticket.owner}>`,
                    }),
                },
            ],
        });
    if (!ticketChannel?.isThread()) {
        await ticketChannel
            .edit({
            permissionOverwrites: (0, main_1.buildChannelPermissionOverwrites)(await (0, getServer_1.getServerGroupsByIds)(ticket.groups, ticket.server), ticket.server, { id: ticket.owner, ...ticketOwnerPermissionsClosed_1.default }, everyoneTicketPermissions_1.default, { id: __1.client.user.id, ...botTicketPermissions_1.default }),
        })
            .catch((err) => logger_1.default.warn(`Failed to edit ticket channel on lock`, err));
    }
    else if (ticketChannel.isThread()) {
        await ticketChannel.members
            .remove(ticket.owner)
            .catch((err) => logger_1.default.warn(`Failed to remove ticket owner on lock`, err));
    }
    "editReply" in repliable
        ? repliable?.editReply((0, lang_1.t)(locale, "TICKET_LOCK"))
        : repliable?.edit({
            content: (0, lang_1.t)(locale, "TICKET_LOCK"),
            components: [
                new discord_js_1.ActionRowBuilder().setComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId(`unlock:${ticketId}`)
                    .setStyle(discord_js_1.ButtonStyle.Primary)
                    .setLabel((0, lang_1.t)(locale, "TICKET_PIN_MESSAGE_COMPONENTS_UNLOCK"))),
            ],
        });
    if (ticketChannel?.isTextBased() && "editReply" in repliable)
        ticketChannel
            .send({
            content: (0, lang_1.t)(locale, "TICKET_LOCK"),
            components: [
                new discord_js_1.ActionRowBuilder().setComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId(`unlock:${ticketId}`)
                    .setStyle(discord_js_1.ButtonStyle.Primary)
                    .setLabel((0, lang_1.t)(locale, "TICKET_PIN_MESSAGE_COMPONENTS_UNLOCK"))),
            ],
        })
            .catch((err) => logger_1.default.warn(`Failed to send message to ticket channel on lock`, err));
}
//# sourceMappingURL=/src/utils/tickets/lock.js.map
//# debugId=5fcca8f5-1453-5c09-a133-36f4ba991e04
