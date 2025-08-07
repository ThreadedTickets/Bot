import { MessageFlags } from "discord.js";
import { TaskScheduler } from "../..";
import { t } from "../../lang";
import { ButtonHandler } from "../../types/Interactions";
import logger from "../../utils/logger";

const button: ButtonHandler = {
  customId: "cancelAwait",
  async execute(client, data, interaction) {
    const tId = interaction.customId.split(":")[1];
    if (!(await TaskScheduler.taskExists(`AWAIT-${tId}`)))
      return interaction.reply({
        content: t(data.lang!, "TICKET_NOT_AWAITING"),
        flags: [MessageFlags.Ephemeral],
      });

    TaskScheduler.removeTask(`AWAIT-${tId}`);
    interaction.reply({
      content: t(data.lang!, "TICKET_AWAIT_CANCEL", {
        user: interaction.user.id,
      }),
      flags: [MessageFlags.Ephemeral],
    });
    interaction.channel.send({
      content: t(data.lang!, "TICKET_AWAIT_CANCEL", {
        user: interaction.user.id,
      }),
      allowedMentions: {},
    });
    logger.debug(`Canceled await-reply task on ticket ${tId}`);
  },
};

export default button;
