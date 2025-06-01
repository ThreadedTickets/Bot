import { t } from "../../lang";
import { PrefixCommand } from "../../types/Command";
import { getServerTicketTrigger } from "../../utils/bot/getServer";
import { onError } from "../../utils/onError";
import { TicketTrigger } from "../../types/Ticket";
import {
  canCreateTicketTarget,
  performTicketChecks,
} from "../../utils/tickets/performChecks";
import { getGuildMember } from "../../utils/bot/getGuildMember";
import { runHooks } from "../../utils/hooks";

const cmd: PrefixCommand<{
  triggerId: string;
  user?: string;
}> = {
  name: "ticket",
  usage: "<triggerId> [user]",

  async execute(client, data, message, args) {
    if (!message.guildId) return;
    if (!message.author.bot) return;
    const triggerId = args.triggerId;
    const user = message.mentions.users.first();

    if (!user)
      return message.reply(
        (await onError("Commands", t(data.lang!, "ERROR_CODE_2013"))).discordMsg
      );

    const trigger = await getServerTicketTrigger(triggerId, message.guildId);
    if (!trigger)
      return message.reply(
        (
          await onError(
            "Commands",
            t(data.lang!, "CONFIG_CREATE_TICKET_TRIGGER_NOT_FOUND")
          )
        ).discordMsg
      );

    const member = await getGuildMember(client, message.guildId, user.id);
    if (!member)
      return message.reply(
        (await onError("Commands", t(data.lang!, "ERROR_CODE_2014"))).discordMsg
      );

    const triggerObject = trigger.toObject();
    const triggerTyped: TicketTrigger = {
      ...triggerObject,
    };

    const msg = await message.reply({
      content: t(data.lang!, "TICKET_CREATE_PERFORMING_CHECKS"),
    });

    const checks = await performTicketChecks(triggerTyped, member);

    if (!checks.allowed) {
      return msg.edit(
        (await onError("Commands", t(data.lang!, `ERROR_CODE_${checks.error}`)))
          .discordMsg
      );
    }

    const checkTargetChannel = await canCreateTicketTarget(
      message.guild!,
      trigger.isThread ? "thread" : "channel",
      trigger.openChannel
    );
    if (!checkTargetChannel.allowed)
      return msg.edit(
        (
          await onError(
            "Commands",
            t(data.lang!, `ERROR_CODE_${checkTargetChannel.error}`)
          )
        ).discordMsg
      );

    await msg.edit({
      content: t(data.lang!, "TICKET_CREATE_CHECKS_PASSED"),
    });

    runHooks("TicketCreate", {
      client: client,
      guild: message.guild!,
      lang: data.lang!,
      messageOrInteraction: msg,
      owner: member.id,
      responses: [],
      trigger: triggerTyped,
      user: user,
    });
  },
};

export default cmd;
