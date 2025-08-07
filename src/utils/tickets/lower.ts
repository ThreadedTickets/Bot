import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  TextChannel,
} from "discord.js";
import { client } from "../..";
import { t } from "../../lang";
import { Locale } from "../../types/Locale";
import { getServer, getTicketTrust } from "../bot/getServer";
import {
  getAvailableLogChannel,
  postLogToWebhook,
} from "../bot/sendLogToWebhook";
import colours from "../../constants/colours";
import { fetchChannelById } from "../bot/fetchMessage";
import { onError } from "../onError";
import { TicketSchema } from "../../database/modals/Ticket";
import { invalidateCache } from "../database/invalidateCache";
import logger from "../logger";

export async function lowerTicket(
  ticketId: string,
  locale: Locale,
  repliable: ButtonInteraction | ChatInputCommandInteraction
) {
  const ticket = await getTicketTrust(ticketId);
  if (!ticket)
    return repliable?.editReply(
      (
        await onError(new Error("Could not find ticket"), {
          ticketId: ticketId,
        })
      ).discordMsg
    );
  if (!ticket.isRaised)
    return repliable?.editReply(t(locale, "TICKET_ALREADY_LOWERED"));
  if (!ticket.allowRaising)
    return repliable?.editReply(t(locale, "TICKET_DOES_NOT_ALLOW_RAISE"));

  await TicketSchema.findOneAndUpdate({ _id: ticketId }, { isRaised: false });
  await invalidateCache(`ticket:${ticketId}`);
  await invalidateCache(`ticketTrust:${ticketId}`);

  const ticketChannel = await fetchChannelById(client, ticket.channel);

  const server = await getServer(ticket.server);
  const logChannel = getAvailableLogChannel(
    server.settings.logging,
    "tickets.lower"
  );
  if (logChannel)
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
            title: t(server.preferredLanguage, "TICKET_LOWER_LOG_TITLE"),
            description: t(server.preferredLanguage, `TICKET_LOWER_LOG_BODY`, {
              user: `<@${ticket.owner}>`,
            }),
          },
        ],
      }
    );

  repliable?.editReply(t(locale, "TICKET_LOWERED"));

  if (ticketChannel?.isTextBased())
    (ticketChannel as TextChannel)
      .send({
        content: t(locale, "TICKET_LOWERED"),
        components: [
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId(`raise:${ticketId}`)
              .setStyle(ButtonStyle.Primary)
              .setLabel(t(locale, "TICKET_PIN_MESSAGE_COMPONENTS_RAISE"))
          ),
        ],
      })
      .catch((err) =>
        logger.warn(`Failed to send message to ticket channel on lower`, err)
      );
}
