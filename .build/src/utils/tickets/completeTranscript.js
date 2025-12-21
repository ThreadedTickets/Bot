"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = completeTranscript;
const __1 = require("../..");
const getServer_1 = require("../bot/getServer");
const sendLogToWebhook_1 = require("../bot/sendLogToWebhook");
const lang_1 = require("../../lang");
const colours_1 = __importDefault(require("../../constants/colours"));
const axios_1 = __importDefault(require("axios"));
async function completeTranscript(serverId, transcriptId, closedAt, closedBy) {
    const ticket = await (0, getServer_1.getTicket)(transcriptId, serverId);
    if (!ticket)
        return;
    const owner = await __1.client.users.fetch(ticket.owner);
    await __1.transcriptService.complete(transcriptId, {
        openedAt: ticket.createdAt,
        openedBy: owner ? `${owner.username} (${ticket.owner})` : ticket.owner,
        closedAt,
        closedBy,
        closeReason: ticket.closeReason ?? null,
    });
    const server = await (0, getServer_1.getServer)(serverId);
    const logChannel = (0, sendLogToWebhook_1.getAvailableLogChannel)(server.settings.logging, "tickets.transcripts");
    if (logChannel) {
        const transcript = await axios_1.default.get(`${process.env.TRANSCRIPT_SERVER_URL}/transcript/${transcriptId}`, {
            headers: {
                Authorization: `Bearer ${process.env.TRANSCRIPT_SERVER_PASS}`,
            },
            responseType: "arraybuffer",
        });
        if (!transcript)
            return;
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
                        id: transcriptId,
                        reason: ticket.closeReason || "No reason provided",
                    }),
                },
            ],
            files: [
                {
                    attachment: Buffer.from(transcript.data),
                    name: `transcript-${transcriptId}.txt`,
                },
            ],
        });
    }
}
//# sourceMappingURL=/src/utils/tickets/completeTranscript.js.map