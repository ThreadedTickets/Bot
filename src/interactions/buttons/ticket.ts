import { GuildMember, MessageFlags, ModalSubmitInteraction } from "discord.js";
import { t } from "../../lang";
import { ButtonHandler, ModalHandler } from "../../types/Interactions";
import {
  TicketForm,
  TicketFormResponse,
  TicketTrigger,
} from "../../types/Ticket";
import {
  getCompletedApplication,
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

const modal: ButtonHandler = {
  customId: "ticket",
  async execute(client, data, interaction) {
    if (!interaction.guildId) return;
    const [, triggerId, applicationId, ownerId] =
      interaction.customId.split(":");
    await interaction.reply({
      content: t(data.lang!, "THINK"),
      flags: [MessageFlags.Ephemeral],
    });

    const trigger = await getServerTicketTrigger(
      triggerId,
      interaction.guildId
    );
    if (!trigger)
      return interaction.editReply(
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

      return interaction.showModal(modal);
    }

    await interaction.editReply({
      content: t(data.lang!, "TICKET_CREATE_PERFORMING_CHECKS"),
    });

    let responses: TicketFormResponse[] = [];
    if (applicationId) {
      const application = await getCompletedApplication(applicationId, ownerId);
      if (application) responses = application.responses;
    }

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
