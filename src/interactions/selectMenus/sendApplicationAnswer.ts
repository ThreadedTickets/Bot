import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import colours from "../../constants/colours";
import { t } from "../../lang";
import { Application } from "../../types/Application";
import { SelectMenuHandler } from "../../types/Interactions";
import { generateQuestionMessage } from "../../utils/applications/generateQuestionMessage";
import { handleApplicationSubmit } from "../../utils/applications/handleApplicationSubmit";
import {
  getServerApplication,
  getServerMessage,
} from "../../utils/bot/getServer";
import { getCache } from "../../utils/database/getCachedElse";
import { updateCachedData } from "../../utils/database/updateCache";
import { toTimeUnit } from "../../utils/formatters/toTimeUnit";
import { resolveDiscordMessagePlaceholders } from "../../utils/message/placeholders/resolvePlaceholders";
import { onError } from "../../utils/onError";

const select: SelectMenuHandler = {
  customId: "appSubmit",
  async execute(client, data, interaction) {
    const [, applicationId, guildId] = interaction.customId.split(":");

    const activeApplication = await getCache(
      `runningApplications:${interaction.user.id}`
    );
    if (!activeApplication.cached)
      return interaction.reply(
        (await onError(new Error(t(data.lang!, `ERROR_CODE_1008`)))).discordMsg
      );

    const appJson = activeApplication.data;
    if (applicationId !== appJson.applicationId)
      return interaction.reply(
        (await onError(new Error(t(data.lang!, `ERROR_CODE_1008`)))).discordMsg
      );
    const application = await getServerApplication(applicationId, guildId);
    if (!application)
      return interaction.reply(
        (await onError(new Error("Application not found"))).discordMsg
      );

    const selection = interaction.values.join(", ");
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
      `runningApplications:${interaction.user.id}`,
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

    interaction.message.edit({ components: [] });
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
        };
      }

      interaction.user.send({
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

      return handleApplicationSubmit(
        applicationTyped,
        newCache,
        interaction.user.id,
        client
      );
    }

    interaction.user.send(
      await generateQuestionMessage(applicationTyped, newCache.questionNumber)
    );
  },
};

export default select;
