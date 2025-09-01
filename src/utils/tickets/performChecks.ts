import {
  ChannelType,
  Guild,
  GuildBasedChannel,
  GuildMember,
  User,
} from "discord.js";
import { TicketTrigger } from "../../types/Ticket";
import { getTickets, getUserTickets } from "../bot/getServer";

export async function performTicketChecks(
  trigger: TicketTrigger,
  member: GuildMember | User
): Promise<{
  allowed: boolean;
  error: null | "2001" | "2002" | "2003" | "2004";
}> {
  const { bannedRoles, requiredRoles, userLimit, serverLimit } = trigger;

  // Role checks
  if ("roles" in member && member.roles.cache.hasAny(...bannedRoles))
    return {
      allowed: false,
      error: "2001",
    };

  if ("roles" in member && !member.roles.cache.hasAll(...requiredRoles))
    return {
      allowed: false,
      error: "2002",
    };

  const openTickets = await getTickets(trigger.server, ["Open"]);

  if (serverLimit > 0 && openTickets.length >= serverLimit)
    return {
      allowed: false,
      error: "2003",
    };

  // User-specific applications
  const userOpenTickets = await getUserTickets(trigger.server, member.id, [
    "Open",
  ]);

  if (userLimit > 0 && userOpenTickets.length >= userLimit) {
    return {
      allowed: false,
      error: "2004",
    };
  }

  return {
    allowed: true,
    error: null,
  };
}

export async function canCreateTicketTarget(
  guild: Guild,
  type: "channel" | "thread",
  parentId?: string | null
): Promise<{ allowed: boolean; error?: string }> {
  // Check guild-wide channel limit
  const allChannels = await guild.channels.fetch();
  const totalChannels = allChannels.size;

  if (type === "channel" && totalChannels >= 500) {
    return {
      allowed: false,
      error: "2005",
    };
  }

  let parent: GuildBasedChannel | null = null;
  if (parentId) {
    try {
      parent = await guild.channels.fetch(parentId);
    } catch {
      return { allowed: false, error: "2006" };
    }

    if (!parent) {
      return { allowed: false, error: "2007" };
    }
  }

  // If creating a channel inside a category
  if (type === "channel" && parent?.type === ChannelType.GuildCategory) {
    const children = parent.children.cache.size;
    if (children >= 50) {
      return {
        allowed: false,
        error: "2008",
      };
    }
  }

  // If creating a thread
  if (type === "thread") {
    if (!parent || parent.type !== ChannelType.GuildText) {
      return {
        allowed: false,
        error: "2009",
      };
    }

    // This stupid thing seems to be pumping out errors, there should be plenty of other error handling
    // const permissions = parent.permissionsFor(guild.members.me!);
    // if (!permissions?.has(PermissionsBitField.Flags.CreatePrivateThreads)) {
    //   return {
    //     allowed: false,
    //     error: "2010",
    //   };
    // }

    const threads = await parent.threads.fetchActive();
    if (threads.threads.size >= 1000) {
      return { allowed: false, error: "2011" };
    }
  }

  // Permissions to create regular channels
  // Not using this cause it causes issues
  // const permissions = guild.members.me?.permissions;
  // if (
  //   type === "channel" &&
  //   !permissions?.has(PermissionsBitField.Flags.ManageChannels)
  // ) {
  //   return { allowed: false, error: "2012" };
  // }

  return { allowed: true };
}
