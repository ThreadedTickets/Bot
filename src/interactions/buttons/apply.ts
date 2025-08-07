import { GuildMember, MessageFlags } from "discord.js";
import { t } from "../../lang";
import { ButtonHandler } from "../../types/Interactions";
import { getServerApplication } from "../../utils/bot/getServer";
import { onError } from "../../utils/onError";
import { performApplicationChecks } from "../../utils/applications/performChecks";
import { Application } from "../../types/Application";
import { runHooks } from "../../utils/hooks";

const button: ButtonHandler = {
  customId: "apply",
  async execute(client, data, interaction) {
    if (!interaction.guildId) return;
    const [, applicationId] = interaction.customId.split(":");
    await interaction.reply({
      content: t(data.lang!, "APPLICATION_PENDING_CHECKS"),
      flags: [MessageFlags.Ephemeral],
    });

    const application = await getServerApplication(
      applicationId,
      interaction.guildId
    );
    if (!application)
      return interaction.editReply(
        (await onError(new Error("Application not found"))).discordMsg
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
      interaction.member as GuildMember,
      true
    );

    if (!checks.allowed) {
      return interaction.editReply(
        (await onError(new Error(t(data.lang!, `ERROR_CODE_${checks.error}`))))
          .discordMsg
      );
    }

    interaction.editReply({
      content: t(data.lang!, "APPLICATION_DIRECT_TO_DMS"),
    });

    runHooks("ApplicationStart", {
      lang: data.lang!,
      user: interaction.user,
      application: applicationTyped,
      server: interaction.guild!,
    });
  },
};

export default button;
