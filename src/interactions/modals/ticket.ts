import { GuildMember, MessageFlags, ModalSubmitInteraction } from "discord.js";
import { t } from "../../lang";
import { ModalHandler } from "../../types/Interactions";
import {
  TicketForm,
  TicketFormResponse,
  TicketTrigger,
} from "../../types/Ticket";
import { getServerTicketTrigger } from "../../utils/bot/getServer";
import { onError } from "../../utils/onError";
import {
  canCreateTicketTarget,
  performTicketChecks,
} from "../../utils/tickets/performChecks";
import { runHooks } from "../../utils/hooks";
import { ticketQueueManager } from "../..";

const modal: ModalHandler = {
  customId: "ticket",
  async execute(client, data, interaction) {
    if (!interaction.guildId) return;
    const [, triggerId] = interaction.customId.split(":");

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

    await interaction.reply({
      content: t(data.lang!, "TICKET_CREATE_PERFORMING_CHECKS"),
      flags: [MessageFlags.Ephemeral],
    });

    const responses = parseTicketFormModalResponse(
      interaction,
      triggerTyped.form
    );

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
