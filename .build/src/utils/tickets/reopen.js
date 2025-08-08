"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="788491b8-7ed8-5513-b7fc-be1f55a92358")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reopenTicket = reopenTicket;
const __1 = require("../..");
const lang_1 = require("../../lang");
const Ticket_1 = require("../../database/modals/Ticket");
const getServer_1 = require("../bot/getServer");
const sendLogToWebhook_1 = require("../bot/sendLogToWebhook");
const colours_1 = __importDefault(require("../../constants/colours"));
const fetchMessage_1 = require("../bot/fetchMessage");
const onError_1 = require("../onError");
const invalidateCache_1 = require("../database/invalidateCache");
const main_1 = require("../hooks/events/tickets/new/main");
const everyoneTicketPermissions_1 = __importDefault(require("../../constants/everyoneTicketPermissions"));
const botTicketPermissions_1 = __importDefault(require("../../constants/botTicketPermissions"));
const ticketOwnerPermissions_1 = __importDefault(require("../../constants/ticketOwnerPermissions"));
const roles_1 = require("../hooks/events/applications/end/roles");
const getGuildMember_1 = require("../bot/getGuildMember");
const logger_1 = __importDefault(require("../logger"));
async function reopenTicket(ticketId, locale, repliable) {
    const ticket = await Ticket_1.TicketSchema.findOneAndUpdate({ _id: ticketId }, {
        status: "Open",
    }, {
        new: false,
    });
    await (0, invalidateCache_1.invalidateCache)(`ticket:${ticketId}`);
    if (!ticket)
        return repliable?.editReply((await (0, onError_1.onError)(new Error("Could not find ticket"), {
            ticketId: ticketId,
        })).discordMsg);
    (0, invalidateCache_1.invalidateCache)(`tickets:${ticket.server}:${ticket.owner}:Open`);
    (0, invalidateCache_1.invalidateCache)(`tickets:${ticket.server}:Open`);
    if (!ticket.allowReopening)
        return repliable?.editReply((0, lang_1.t)(locale, "REOPEN_NOT_SUPPORTED"));
    if (ticket.status === "Open")
        return repliable?.editReply((0, lang_1.t)(locale, "TICKET_ALREADY_OPEN"));
    const ticketChannel = await (0, fetchMessage_1.fetchChannelById)(__1.client, ticket.channel);
    const member = await (0, getGuildMember_1.getGuildMember)(__1.client, ticket.server, ticket.owner);
    if (member)
        (0, roles_1.updateMemberRoles)(__1.client, member, [...ticket.removeRolesOnClose, ...ticket.addRolesOnOpen], [...ticket.addRolesOnClose, ...ticket.removeRolesOnOpen]);
    const server = await (0, getServer_1.getServer)(ticket.server);
    const logChannel = (0, sendLogToWebhook_1.getAvailableLogChannel)(server.settings.logging, "tickets.open");
    if (logChannel)
        await (0, sendLogToWebhook_1.postLogToWebhook)(__1.client, {
            channel: logChannel.channel,
            enabled: logChannel.enabled,
            webhook: logChannel.webhook,
        }, {
            embeds: [
                {
                    color: parseInt(colours_1.default.info, 16),
                    title: (0, lang_1.t)(server.preferredLanguage, "TICKET_REOPEN_LOG_TITLE"),
                    description: (0, lang_1.t)(server.preferredLanguage, `TICKET_REOPEN_LOG_BODY`, {
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
            .catch((err) => logger_1.default.warn(`Failed to edit ticket channel on reopen`, err));
    }
    __1.TaskScheduler.removeTask(`CLOSE-${ticketId}`);
    repliable?.editReply((0, lang_1.t)(locale, "TICKET_REOPEN"));
    if (ticketChannel?.isTextBased())
        ticketChannel
            .send({
            content: (0, lang_1.t)(locale, "TICKET_REOPEN"),
        })
            .catch((err) => logger_1.default.warn(`Failed to send message to ticket channel on reopen`, err));
    else if (ticketChannel?.isThread()) {
        await ticketChannel.members
            .add(ticket.owner)
            .catch((err) => logger_1.default.warn(`Failed to add ticket owner on reopen`, err));
    }
}
//# sourceMappingURL=/src/utils/tickets/reopen.js.map
//# debugId=788491b8-7ed8-5513-b7fc-be1f55a92358
