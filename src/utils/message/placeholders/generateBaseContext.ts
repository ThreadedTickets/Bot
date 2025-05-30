import { Channel, Guild, GuildMember, User } from "discord.js";

export function generateBasePlaceholderContext(options: {
  server: Guild;
  user?: User;
  member?: GuildMember;
  channel?: Channel;
}) {
  const { server, user, member, channel } = options;
  const context: {
    server?: {
      id: string;
      name: string;
      members: number;
      boosts: number;
    };
    user?: {
      id: string;
      username: string;
      displayname: string;
      avatar: string;
    };
    member?: {
      roles: {
        flat: string;
        mentions: string;
        ids: string;
        names: string;
        highest: {
          id: string;
          name: string;
          flat: string;
          mention: string;
        };
      };
      nickname: string;
    };
    channel?: {
      id: string;
      name: string;
    };
  } = {};

  if (options.server)
    context["server"] = {
      id: server.id,
      name: server.name,
      boosts: server.premiumSubscriptionCount || 0,
      members: server.memberCount,
    };
  if (options.user)
    context["user"] = {
      id: user!.id,
      displayname: user!.displayName,
      avatar: user!.avatarURL() || "",
      username: user!.username,
    };
  if (options.channel)
    context["channel"] = {
      id: channel!.id,
      name: "name" in channel! ? channel.name! : "",
    };
  if (options.member) {
    const roles = member!.roles.cache
      .filter((role) => role.id !== server.id)
      .map((role) => ({
        id: role.id,
        name: role.name,
      }));

    const highestRole = member!.roles.highest;
    /**
     * .replace(new RegExp(/([*_~])/g), "\\$1")
     * can make it suit discord formatting
     */
    context["member"] = {
      nickname: member!.nickname || user!.displayName,
      roles: {
        flat: roles.map((r) => `@${r.name}`).join(", "),
        names: roles.map((r) => r.name).join(", "),
        mentions: roles.map((r) => `<@&${r.id}>`).join(", "),
        ids: roles.map((r) => r.id).join(", "),
        highest: {
          flat: `@${highestRole.name}`,
          id: highestRole.id,
          name: highestRole.name,
          mention: `<@&${highestRole.id}>`,
        },
      },
    };
  }

  return context;
}
