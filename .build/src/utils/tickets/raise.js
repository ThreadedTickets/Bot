"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="62a2e891-8a1d-5492-9693-a6104fdb338c")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.raiseTicket = raiseTicket;
const discord_js_1 = require("discord.js");
const __1 = require("../..");
const lang_1 = require("../../lang");
const getServer_1 = require("../bot/getServer");
const sendLogToWebhook_1 = require("../bot/sendLogToWebhook");
const colours_1 = __importDefault(require("../../constants/colours"));
const fetchMessage_1 = require("../bot/fetchMessage");
const onError_1 = require("../onError");
const Ticket_1 = require("../../database/modals/Ticket");
const invalidateCache_1 = require("../database/invalidateCache");
const logger_1 = __importDefault(require("../logger"));
async function raiseTicket(ticketId, locale, repliable) {
    const ticket = await (0, getServer_1.getTicketTrust)(ticketId);
    if (!ticket)
        return repliable?.editReply((await (0, onError_1.onError)(new Error("Could not find ticket"), {
            ticketId: ticketId,
        })).discordMsg);
    if (!ticket.allowRaising)
        return repliable?.editReply((0, lang_1.t)(locale, "TICKET_DOES_NOT_ALLOW_RAISE"));
    if (ticket.isRaised)
        return repliable?.editReply((0, lang_1.t)(locale, "TICKET_ALREADY_RAISED"));
    await Ticket_1.TicketSchema.findOneAndUpdate({ _id: ticketId }, { isRaised: true });
    await (0, invalidateCache_1.invalidateCache)(`ticket:${ticketId}`);
    await (0, invalidateCache_1.invalidateCache)(`ticketTrust:${ticketId}`);
    const ticketChannel = await (0, fetchMessage_1.fetchChannelById)(__1.client, ticket.channel);
    const server = await (0, getServer_1.getServer)(ticket.server);
    const logChannel = (0, sendLogToWebhook_1.getAvailableLogChannel)(server.settings.logging, "tickets.raise");
    if (logChannel)
        await (0, sendLogToWebhook_1.postLogToWebhook)(__1.client, {
            channel: logChannel.channel,
            enabled: logChannel.enabled,
            webhook: logChannel.webhook,
        }, {
            embeds: [
                {
                    color: parseInt(colours_1.default.info, 16),
                    title: (0, lang_1.t)(server.preferredLanguage, "TICKET_RAISE_LOG_TITLE"),
                    description: (0, lang_1.t)(server.preferredLanguage, `TICKET_RAISE_LOG_BODY`, {
                        user: `<@${ticket.owner}>`,
                    }),
                },
            ],
        });
    repliable?.editReply((0, lang_1.t)(locale, "TICKET_RAISED"));
    if (ticketChannel?.isTextBased())
        ticketChannel
            .send({
            content: (0, lang_1.t)(locale, "TICKET_RAISED"),
            components: [
                new discord_js_1.ActionRowBuilder().setComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId(`lower:${ticketId}`)
                    .setStyle(discord_js_1.ButtonStyle.Primary)
                    .setLabel((0, lang_1.t)(locale, "TICKET_PIN_MESSAGE_COMPONENTS_LOWER"))),
            ],
        })
            .catch((err) => logger_1.default.warn(`Failed to send message to ticket channel on raise`, err));
}
//# sourceMappingURL=/src/utils/tickets/raise.js.map
//# debugId=62a2e891-8a1d-5492-9693-a6104fdb338c
