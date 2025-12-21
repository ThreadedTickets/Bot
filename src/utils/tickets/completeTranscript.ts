import { AttachmentBuilder, Client } from "discord.js";
import { client, transcriptService } from "../..";
import { Locale } from "../../types/Locale";
import { getServer, getTicket } from "../bot/getServer";
import { getAvailableLogChannel, postLogToWebhook } from "../bot/sendLogToWebhook";
import { t } from "../../lang";
import colours from "../../constants/colours";
import axios from "axios";

export default async function completeTranscript(
  serverId: string,
  transcriptId: string,
  closedAt: Date,
  closedBy: string
) {
  const ticket = await getTicket(transcriptId, serverId);
  if (!ticket) return;

  const owner = await (client as Client).users.fetch(ticket.owner);

  await transcriptService.complete(transcriptId, {
    openedAt: ticket.createdAt,
    openedBy: owner ? `${owner.username} (${ticket.owner})` : ticket.owner,
    closedAt,
    closedBy,
    closeReason: ticket.closeReason ?? null,
  });

  const server = await getServer(serverId);

  const logChannel = getAvailableLogChannel(server.settings.logging, "tickets.transcripts");
  if (logChannel) {
    const transcript = await axios.get(`${process.env.TRANSCRIPT_SERVER_URL}/transcript/${transcriptId}`, {
      headers: {
        Authorization: `Bearer ${process.env.TRANSCRIPT_SERVER_PASS}`,
      },
      responseType: "arraybuffer",
    });
    if (!transcript) return;
    await postLogToWebhook(
      client,
      {
        channel: logChannel.channel!,
        enabled: logChannel.enabled,
        webhook: logChannel.webhook!,
      },
      {
        embeds: [
          {
            color: parseInt(colours.info, 16),
            title: t(server.preferredLanguage, "TICKET_CLOSE_WITH_TRANSCRIPT_LOG_TITLE"),
            description: t(server.preferredLanguage, `TICKET_CLOSE_WITH_TRANSCRIPT_LOG_BODY`, {
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
      }
    );
  }
}
