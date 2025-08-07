import { massCloseManager } from "..";
import { Event } from "../types/Event";
import { getUserTickets } from "../utils/bot/getServer";
import { invalidateCache } from "../utils/database/invalidateCache";
import { closeTicket } from "../utils/tickets/close";
import { formatDuration } from "../utils/formatters/duration";
import logger from "../utils/logger";

const event: Event<"guildMemberRemove"> = {
  name: "guildMemberRemove",
  async execute(client, data, member) {
    const start = new Date().getTime();
    const user = member;
    await invalidateCache(`tickets:${member.guild.id}:${user.id}:Locked|Open`);
    const userTickets = (
      await getUserTickets(member.guild.id, user.id, ["Open", "Locked"])
    ).filter((t) => t.closeOnLeave);

    if (!userTickets.length) return;

    let failed = userTickets.length;

    massCloseManager.wrap(async () => {
      for (const ticket of userTickets) {
        const a = await massCloseManager.wrap(async () => {
          await closeTicket(ticket._id, data?.lang ?? "en");
          return true;
        });
        if (a) failed--;
      }
    }, member.guild.id);

    logger.debug(
      `Finished mass close of ${userTickets.length} tickets in ${
        member.guild.name
      }. Took ${formatDuration(new Date().getTime() - start)}`,
      { user: user.id }
    );
  },
};

export default event;
