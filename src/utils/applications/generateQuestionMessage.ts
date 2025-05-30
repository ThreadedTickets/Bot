import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import colours from "../../constants/colours";
import { Application } from "../../types/Application";
import { getServerMessage } from "../bot/getServer";
import { resolveDiscordMessagePlaceholders } from "../message/placeholders/resolvePlaceholders";

export async function generateQuestionMessage(
  application: Application,
  questionNumber: number
): Promise<{
  content?: string;
  embeds?: any;
  components?: any;
}> {
  const question = application.questions[questionNumber];

  let baseMessage: {
    content?: string;
    embeds?: any[];
    components?: any[];
  } = {
    embeds: [
      {
        title: "{applicationName}",
        color: parseInt(colours.primary, 16),
        description: `**{questionNumber}/{totalQuestions}**: {question}`,
      },
    ],
    components: [],
  };

  const customMessage = question.message
    ? await getServerMessage(question.message, application.server)
    : null;

  if (customMessage) {
    baseMessage = {
      content: customMessage.content,
      embeds: customMessage.embeds,
      components: customMessage.components,
    };
  }

  if (question.type === "choice") {
    const selectMenu = new StringSelectMenuBuilder().setCustomId(
      `appSubmit:${application._id}:${application.server}`
    );

    if (question.minimum !== null)
      selectMenu.setMinValues(
        Math.max(0, Math.min(25, Math.abs(question.minimum)))
      );
    if (question.maximum !== null)
      selectMenu.setMaxValues(
        Math.min(25, Math.max(1, Math.abs(question.maximum)))
      );

    for (const option of question.choices ?? []) {
      selectMenu.addOptions({
        label: option.slice(0, 100),
        value: option.slice(0, 100),
      });
    }

    baseMessage.components = [
      new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(selectMenu)
        .toJSON(),
    ];
  }

  return resolveDiscordMessagePlaceholders(baseMessage, {
    question: question.question,
    questionNumber: questionNumber + 1,
    totalQuestions: application.questions.length,
    applicationName: application.name,
    max: question.maximum,
    min: question.minimum,
  });
}
