import { GuildMember, MessageFlags, ModalSubmitInteraction } from "discord.js";
import { t } from "../../lang";
import { SelectMenuHandler } from "../../types/Interactions";
import {
  TicketForm,
  TicketFormResponse,
  TicketTrigger,
} from "../../types/Ticket";
import {
  getServerApplication,
  getServerTicketTrigger,
} from "../../utils/bot/getServer";
import { onError } from "../../utils/onError";
import {
  canCreateTicketTarget,
  performTicketChecks,
} from "../../utils/tickets/performChecks";
import { runHooks } from "../../utils/hooks";
import { ticketQueueManager } from "../..";
import { buildTicketFormModal } from "../../utils/tickets/buildFormModal";
import { performApplicationChecks } from "../../utils/applications/performChecks";
import { Application } from "../../types/Application";

const modal: SelectMenuHandler = {
  customId: "ticket",
  async execute(client, data, interaction) {
    if (!interaction.guildId) return;

    if (interaction.values[0].split(":")[0] === "apply") {
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
        interaction.member as GuildMember,
        true
      );

      if (!checks.allowed) {
        return interaction.editReply(
          (
            await onError(
              "Commands",
              t(data.lang!, `ERROR_CODE_${checks.error}`)
            )
          ).discordMsg
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
    } else {
      const [, triggerId] = interaction.values[0].split(":");

      const trigger = await getServerTicketTrigger(
        triggerId,
        interaction.guildId
      );
      if (!trigger)
        return interaction.reply(
          (
            await onError(
              "Commands",
              t(data.lang!, "CONFIG_CREATE_TICKET_TRIGGER_NOT_FOUND")
            )
          ).discordMsg
        );

      const triggerObject = trigger.toObject();
      const triggerTyped: TicketTrigger = {
        ...triggerObject,
      };

      if (trigger.form.length) {
        const modal = buildTicketFormModal(
          triggerTyped.form,
          `ticket:${trigger._id}`,
          triggerTyped.label
        );

        if (modal instanceof Error)
          return await interaction.reply({
            ...(
              await onError("Tickets", modal.message, { stack: modal.stack })
            ).discordMsg,
            flags: [MessageFlags.Ephemeral],
          });

        return await interaction.showModal(modal);
      }

      await interaction.reply({
        content: t(data.lang!, "TICKET_CREATE_PERFORMING_CHECKS"),
        flags: [MessageFlags.Ephemeral],
      });

      let responses: TicketFormResponse[] = [];

      ticketQueueManager.wrap(async () => {
        const checks = await performTicketChecks(
          triggerTyped,
          interaction.member as GuildMember
        );

        if (!checks.allowed) {
          return interaction.editReply(
            (
              await onError(
                "Commands",
                t(data.lang!, `ERROR_CODE_${checks.error}`)
              )
            ).discordMsg
          );
        }

        const checkTargetChannel = await canCreateTicketTarget(
          interaction.guild!,
          trigger.isThread ? "thread" : "channel",
          trigger.openChannel || interaction.channelId
        );
        if (!checkTargetChannel.allowed)
          return interaction.editReply(
            (
              await onError(
                "Commands",
                t(data.lang!, `ERROR_CODE_${checkTargetChannel.error}`)
              )
            ).discordMsg
          );

        await interaction.editReply({
          content: t(data.lang!, "TICKET_CREATE_CHECKS_PASSED"),
        });

        await runHooks("TicketCreate", {
          client: client,
          guild: interaction.guild!,
          lang: data.lang!,
          messageOrInteraction: interaction,
          owner: interaction.user.id,
          responses: responses,
          trigger: triggerTyped,
          user: interaction.user,
        });
      }, interaction.guildId);
    }
  },
};

export default modal;

export function parseTicketFormModalResponse(
  interaction: ModalSubmitInteraction,
  form: TicketForm[]
): TicketFormResponse[] {
  const responses: TicketFormResponse[] = [];

  for (let i = 0; i < form.length; i++) {
    const question = form[i].question;
    const customId = `form_${i}`;

    const value = interaction.fields.getTextInputValue(customId);
    responses.push({
      question,
      response: value,
    });
  }

  return responses;
}
