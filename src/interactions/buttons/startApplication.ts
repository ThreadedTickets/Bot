import { MessageFlags, User } from "discord.js";
import { t } from "../../lang";
import { Application } from "../../types/Application";
import { ButtonHandler } from "../../types/Interactions";
import { getServerApplication } from "../../utils/bot/getServer";
import { onError } from "../../utils/onError";
import { performApplicationChecks } from "../../utils/applications/performChecks";
import { generateQuestionMessage } from "../../utils/applications/generateQuestionMessage";
import { updateCachedData } from "../../utils/database/updateCache";
import { toTimeUnit } from "../../utils/formatters/toTimeUnit";

const button: ButtonHandler = {
  customId: "startApp",
  async execute(client, data, interaction) {
    const [, applicationId, guildId] = interaction.customId.split(":");
    await interaction.reply({
      content: t(data.lang!, "APPLICATION_PENDING_CHECKS"),
      flags: [MessageFlags.Ephemeral],
    });

    const application = await getServerApplication(applicationId, guildId);
    if (!application)
      return interaction.editReply(
        (
          await onError(
            "Commands",
            t(data.lang!, "CONFIG_CREATE_APPLICATION_NOT_FOUND")
          )
        ).discordMsg
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

    const checks = await performApplicationChecks(
      applicationTyped,
      interaction.user as User,
      true,
      false
    );

    if (!checks.allowed) {
      return interaction.editReply(
        (await onError("Commands", t(data.lang!, `ERROR_CODE_${checks.error}`)))
          .discordMsg
      );
    }

    await interaction.deleteReply();
    interaction.message.edit({ components: [] }).catch(() => {});
    interaction.user.send(await generateQuestionMessage(applicationTyped, 0));
    await updateCachedData(
      `runningApplications:${interaction.user.id}`,
      toTimeUnit("seconds", 0, 0, 0, 1),
      {
        applicationId: applicationTyped._id,
        startTime: new Date(),
        server: applicationTyped.server,
        questionNumber: 0,
        questions: applicationTyped.questions,

        responses: [],
      }
    );
  },
};

export default button;
