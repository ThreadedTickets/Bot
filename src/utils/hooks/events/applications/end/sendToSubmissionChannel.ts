import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
} from "discord.js";
import { registerHook } from "../../..";
import {
  Application,
  ApplicationQuestion,
} from "../../../../../types/Application";
import { getServer } from "../../../../bot/getServer";
import colours from "../../../../../constants/colours";
import { sendMessageToChannel } from "../../../../bot/sendMessageToChannel";
import { t } from "../../../../../lang";
import { formatDuration } from "../../../../formatters/duration";
import { logger } from "../../../../logger";
import { CompletedApplicationSchema } from "../../../../../database/modals/CompletedApplications";
type QA = { question: string; response: string };

const EMBED_TOTAL_CHAR_LIMIT = 6000;
const FIELD_NAME_LIMIT = 256;
const FIELD_VALUE_LIMIT = 1024;
const EMBEDS_PER_MESSAGE = 10;

export function buildQAMessages(pairs: QA[]) {
  const messages: { embeds: any[] }[] = [];
  let currentMessage: { embeds: any[] } = { embeds: [] };
  let currentEmbed = createNewEmbed();
  let totalEmbedChars = 0;

  for (const { question, response } of pairs) {
    let remainingResponse = response || "None";
    let fieldName = truncate(question, FIELD_NAME_LIMIT);
    let chunkIndex = 0;

    while (remainingResponse.length > 0) {
      // Get a chunk of response that fits within the field value limit
      let chunk = remainingResponse.slice(0, FIELD_VALUE_LIMIT);
      remainingResponse = remainingResponse.slice(FIELD_VALUE_LIMIT);

      // If this is a continued chunk, update the field name
      const name =
        chunkIndex === 0
          ? fieldName
          : truncate(`${fieldName} (continued)`, FIELD_NAME_LIMIT);
      chunkIndex++;

      // Check if adding this field exceeds embed limits
      const fieldCharCount = name.length + chunk.length;
      if (
        currentEmbed.fields.length >= 25 ||
        totalEmbedChars + fieldCharCount > EMBED_TOTAL_CHAR_LIMIT
      ) {
        // Save current embed to message
        currentMessage.embeds.push(currentEmbed);

        // If current message has max embeds, push it and start a new one
        if (currentMessage.embeds.length >= EMBEDS_PER_MESSAGE) {
          messages.push(currentMessage);
          currentMessage = { embeds: [] };
        }

        currentEmbed = createNewEmbed();
        totalEmbedChars = 0;
      }

      // Add the field to the current embed
      currentEmbed.fields.push({ name, value: chunk });
      totalEmbedChars += fieldCharCount;
    }
  }

  // Push any remaining data
  if (currentEmbed.fields.length > 0) {
    currentMessage.embeds.push(currentEmbed);
  }
  if (currentMessage.embeds.length > 0) {
    messages.push(currentMessage);
  }

  return messages;
}

function createNewEmbed() {
  return {
    fields: [] as { name: string; value: string }[],
    color: parseInt(colours.primary, 16),
  };
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 3) + "..." : str;
}

registerHook(
  "ApplicationFinal",
  async ({
    client,
    application,
    responses,
    owner,
    id,
  }: {
    client: Client;
    application: Application;
    responses: {
      applicationId: string;
      startTime: Date;
      server: string;
      questionNumber: number;
      questions: ApplicationQuestion[];

      responses: { question: string; response: string }[];
    };
    owner: string;
    id: string;
  }) => {
    const submissionChannel = application.submissionsChannel;
    if (!submissionChannel) return;

    const server = await getServer(application.server);

    const message = await sendMessageToChannel(
      client,
      application.server,
      submissionChannel,
      {
        content:
          application.pingRoles.map((r) => `<@&${r}>`).join(", ") || undefined,
        embeds: [
          {
            title: t(server.preferredLanguage, "NEW_APPLICATION_SUBMIT_TITLE", {
              application: application.name,
            }),
            color: parseInt(colours.success, 16),
            description: `> ${t(
              server.preferredLanguage,
              "NEW_APPLICATION_SUBMIT_BODY_OWNER",
              { user: `<@${owner}> (\`${owner}\`)` }
            )}\n> ${t(
              server.preferredLanguage,
              "NEW_APPLICATION_SUBMIT_BODY_DURATION",
              {
                duration: formatDuration(
                  new Date().getTime() - new Date(responses.startTime).getTime()
                ),
              }
            )}\n> ${t(
              server.preferredLanguage,
              "NEW_APPLICATION_SUBMIT_BODY_INFORMATION"
            )}`,
          },
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId(`accApp:${id}:${owner}`)
              .setLabel("Accept")
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`rejApp:${id}:${owner}`)
              .setLabel("Reject")
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId(`delApp:${id}:${owner}`)
              .setLabel("Delete")
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId(
                `ticket:${application.linkedTicketTrigger}:${id}:${owner}`
              )
              .setLabel("Create Ticket")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(application.linkedTicketTrigger ? false : true),
            new ButtonBuilder()
              .setCustomId(`appHistory:${application._id}:${owner}`)
              .setLabel("View History")
              .setStyle(ButtonStyle.Primary)
          ),
        ],
      }
    );

    if (!message)
      return logger(
        "System",
        "Warn",
        "Failed to send application submission message"
      );

    const thread = await message.startThread({
      name: `Application - ${application.name} - ${owner}`.slice(0, 100),
      reason: "Creating thread on submission message for staff discussion",
    });

    // Just gives me a message link in the DB that i can work with
    await CompletedApplicationSchema.findOneAndUpdate(
      { _id: id },
      { messageLink: message.url }
    );

    if (!thread) return;
    const QAMessages = buildQAMessages(responses.responses);
    for (const message of QAMessages) {
      thread.send(message).catch(() => {});
    }
  }
);
