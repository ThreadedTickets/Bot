import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import colours from "../constants/colours";
import { t } from "../lang";
import { Application } from "../types/Application";
import { Event } from "../types/Event";
import { generateQuestionMessage } from "../utils/applications/generateQuestionMessage";
import { handleApplicationSubmit } from "../utils/applications/handleApplicationSubmit";
import { getServerApplication, getServerMessage } from "../utils/bot/getServer";
import { getCache } from "../utils/database/getCachedElse";
import { invalidateCache } from "../utils/database/invalidateCache";
import { updateCachedData } from "../utils/database/updateCache";
import { toTimeUnit } from "../utils/formatters/toTimeUnit";
import { resolveDiscordMessagePlaceholders } from "../utils/message/placeholders/resolvePlaceholders";
import { onError } from "../utils/onError";

const event: Event<"messageCreate"> = {
  name: "messageCreate",
  once: false,
  async execute(client, data, message) {
    if (message.guild) return;
    if (message.author.bot) return;

    const activeApplication = await getCache(
      `runningApplications:${message.author.id}`
    );
    // console.log("Result:", activeApplication);
    // console.log("Raw data:", JSON.stringify(activeApplication.data, null, 2));

    if (!activeApplication.cached)
      return message.reply(
        (await onError(new Error(t(data!.lang!, `ERROR_CODE_1008`)))).discordMsg
      );

    const appJson = activeApplication.data;
    const { applicationId, server } = appJson;
    const application = await getServerApplication(applicationId, server);
    if (!application)
      return message.reply(
        (await onError(new Error("Application not found"))).discordMsg
      );

    const selection = message.content;
    // Now validate the content

    const currentQuestion = appJson.questions[appJson.questionNumber];

    if (selection.toLocaleLowerCase() === "cancel") {
      let baseMessage: {
        content?: string;
        embeds?: any[];
        components?: any[];
      } = {
        embeds: [
          {
            title: "{applicationName}",
            color: parseInt(colours.primary, 16),
            description: t(data?.lang!, "APPLICATION_DEFAULT_MESSAGE_CANCELED"),
          },
        ],
      };

      const customMessage = application.cancelMessage
        ? await getServerMessage(application.cancelMessage, application.server)
        : null;

      if (customMessage) {
        baseMessage = {
          content: customMessage.content,
          embeds: customMessage.embeds,
        };
      }

      await invalidateCache(`runningApplications:${message.author.id}`);

      return message.reply({
        components: [
          new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setURL(process.env["DISCORD_APPLICATION_INVITE"]!)
                .setStyle(ButtonStyle.Link)
                .setLabel(
                  t(data?.lang!, "APPLICATION_DEFAULT_MESSAGE_SUBMITTED_BUTTON")
                )
            )
            .toJSON(),
        ],
        ...resolveDiscordMessagePlaceholders(baseMessage, {
          applicationName: application.name,
        }),
      });
    }

    if (currentQuestion.type === "choice") return;

    if (currentQuestion.type === "text") {
      if (message.attachments.size > 0)
        return message.reply(
          (await onError(new Error(t(data!.lang!, `ERROR_CODE_1014`))))
            .discordMsg
        );
      if (currentQuestion.minimum && selection.length < currentQuestion.minimum)
        return message.reply(
          (
            await onError(
              new Error(
                t(data!.lang!, `ERROR_CODE_1009`, {
                  min: currentQuestion.minimum,
                })
              )
            )
          ).discordMsg
        );

      if (currentQuestion.maximum && selection.length > currentQuestion.maximum)
        return message.reply(
          (
            await onError(
              new Error(
                t(data!.lang!, `ERROR_CODE_1010`, {
                  max: currentQuestion.maximum,
                })
              )
            )
          ).discordMsg
        );
    } else if (currentQuestion.type === "number") {
      if (isNaN(parseInt(selection)))
        return message.reply(
          (
            await onError(
              new Error(
                t(data!.lang!, `ERROR_CODE_1013`, {
                  min: currentQuestion.minimum,
                })
              )
            )
          ).discordMsg
        );
      if (
        currentQuestion.minimum &&
        parseFloat(selection) < currentQuestion.minimum
      )
        return message.reply(
          (
            await onError(
              new Error(
                t(data!.lang!, `ERROR_CODE_1011`, {
                  min: currentQuestion.minimum,
                })
              )
            )
          ).discordMsg
        );

      if (
        currentQuestion.maximum &&
        parseFloat(selection) > currentQuestion.maximum
      )
        return message.reply(
          (
            await onError(
              new Error(
                t(data!.lang!, `ERROR_CODE_1012`, {
                  max: currentQuestion.maximum,
                })
              )
            )
          ).discordMsg
        );
    }

    const newCache = {
      ...appJson,
      questionNumber: appJson.questionNumber + 1,
      responses: [
        ...appJson.responses,
        {
          question: appJson.questions[appJson.questionNumber].question,
          response: selection,
        },
      ],
    };

    updateCachedData(
      `runningApplications:${message.author.id}`,
      toTimeUnit("seconds", 0, 0, 0, 1),
      newCache
    );

    const appObject = application.toObject();
    const applicationTyped: Application = {
      ...appObject,
      open: appObject.open?.toISOString() ?? null,
      close: appObject.close?.toISOString() ?? null,
      acceptedMessage: appObject.acceptedMessage ?? null,
      rejectedMessage: appObject.rejectedMessage ?? null,
      submissionMessage: appObject.submissionMessage ?? null,
      cancelMessage: appObject.cancelMessage ?? null,
      confirmationMessage: appObject.confirmationMessage ?? null,
    };

    // Reached the end of the app
    if (newCache.questionNumber >= newCache.questions.length) {
      let baseMessage: {
        content?: string;
        embeds?: any[];
        components?: any[];
      } = {
        embeds: [
          {
            title: "{applicationName}",
            color: parseInt(colours.primary, 16),
            description: t(
              data?.lang!,
              "APPLICATION_DEFAULT_MESSAGE_SUBMITTED"
            ),
          },
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setURL(process.env["DISCORD_APPLICATION_INVITE"]!)
                .setStyle(ButtonStyle.Link)
                .setLabel(
                  t(data?.lang!, "APPLICATION_DEFAULT_MESSAGE_SUBMITTED_BUTTON")
                )
            )
            .toJSON(),
        ],
      };

      const customMessage = application.submissionMessage
        ? await getServerMessage(
            application.submissionMessage,
            application.server
          )
        : null;

      if (customMessage) {
        baseMessage = {
          content: customMessage.content,
          embeds: customMessage.embeds,
          components: [
            new ActionRowBuilder<ButtonBuilder>()
              .addComponents(
                new ButtonBuilder()
                  .setURL(process.env["DISCORD_APPLICATION_INVITE"]!)
                  .setStyle(ButtonStyle.Link)
                  .setLabel(
                    t(
                      data?.lang!,
                      "APPLICATION_DEFAULT_MESSAGE_SUBMITTED_BUTTON"
                    )
                  )
              )
              .toJSON(),
          ],
        };
      }

      message.author.send(
        resolveDiscordMessagePlaceholders(baseMessage, {
          applicationName: application.name,
        })
      );

      return handleApplicationSubmit(
        applicationTyped,
        newCache,
        message.author.id,
        client
      );
    }

    message.author.send(
      await generateQuestionMessage(applicationTyped, newCache.questionNumber)
    );
  },
};

export default event;
