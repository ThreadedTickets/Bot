"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlockTicket = unlockTicket;
const __1 = require("../..");
const lang_1 = require("../../lang");
const getServer_1 = require("../bot/getServer");
const sendLogToWebhook_1 = require("../bot/sendLogToWebhook");
const colours_1 = __importDefault(require("../../constants/colours"));
const fetchMessage_1 = require("../bot/fetchMessage");
const onError_1 = require("../onError");
const main_1 = require("../hooks/events/tickets/new/main");
const everyoneTicketPermissions_1 = __importDefault(require("../../constants/everyoneTicketPermissions"));
const botTicketPermissions_1 = __importDefault(require("../../constants/botTicketPermissions"));
const Ticket_1 = require("../../database/modals/Ticket");
const invalidateCache_1 = require("../database/invalidateCache");
const ticketOwnerPermissions_1 = __importDefault(require("../../constants/ticketOwnerPermissions"));
const logger_1 = __importDefault(require("../logger"));
async function unlockTicket(ticketId, locale, repliable) {
    const ticket = await (0, getServer_1.getTicketTrust)(ticketId);
    if (!ticket)
        return repliable?.editReply((await (0, onError_1.onError)(new Error("Could not find ticket"), {
            ticketId: ticketId,
        })).discordMsg);
    (0, invalidateCache_1.invalidateCache)(`tickets:${ticket.server}:${ticket.owner}:Open`);
    (0, invalidateCache_1.invalidateCache)(`tickets:${ticket.server}:Open`);
    if (ticket.status !== "Locked")
        return repliable?.editReply((0, lang_1.t)(locale, "TICKET_NOT_LOCKED"));
    await Ticket_1.TicketSchema.findOneAndUpdate({ _id: ticketId }, { status: "Open" });
    await (0, invalidateCache_1.invalidateCache)(`ticket:${ticketId}`);
    await (0, invalidateCache_1.invalidateCache)(`ticketTrust:${ticketId}`);
    const ticketChannel = await (0, fetchMessage_1.fetchChannelById)(__1.client, ticket.channel);
    const server = await (0, getServer_1.getServer)(ticket.server);
    const logChannel = (0, sendLogToWebhook_1.getAvailableLogChannel)(server.settings.logging, "tickets.unlock");
    if (logChannel)
        await (0, sendLogToWebhook_1.postLogToWebhook)(__1.client, {
            channel: logChannel.channel,
            enabled: logChannel.enabled,
            webhook: logChannel.webhook,
        }, {
            embeds: [
                {
                    color: parseInt(colours_1.default.info, 16),
                    title: (0, lang_1.t)(server.preferredLanguage, "TICKET_UNLOCK_LOG_TITLE"),
                    description: (0, lang_1.t)(server.preferredLanguage, `TICKET_UNLOCK_LOG_BODY`, {
                        user: `<@${ticket.owner}>`,
                    }),
                },
            ],
        });
    if (!ticketChannel?.isThread()) {
        await ticketChannel
            .edit({
            permissionOverwrites: (0, main_1.buildChannelPermissionOverwrites)(await (0, getServer_1.getServerGroupsByIds)(ticket.groups, ticket.server), ticket.server, { id: ticket.owner, ...ticketOwnerPermissions_1.default }, everyoneTicketPermissions_1.default, { id: __1.client.user.id, ...botTicketPermissions_1.default }),
        })
            .catch((err) => logger_1.default.warn(`Failed to edit ticket channel on unlock`, err));
    }
    else if (ticketChannel?.isThread()) {
        await ticketChannel.members
            .add(ticket.owner)
            .catch((err) => logger_1.default.warn(`Failed to add ticket owner on unlock`, err));
    }
    repliable?.editReply((0, lang_1.t)(locale, "TICKET_UNLOCK"));
    if (ticketChannel?.isTextBased())
        ticketChannel
            .send({
            content: (0, lang_1.t)(locale, "TICKET_UNLOCK"),
        })
            .catch((err) => logger_1.default.warn(`Failed to send message to ticket channel on unlock`, err));
}
//# sourceMappingURL=/src/utils/tickets/unlock.js.map