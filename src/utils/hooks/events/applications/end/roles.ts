import { Client, GuildMember } from "discord.js";
import { registerHook } from "../../..";
import {
  Application,
  ApplicationQuestion,
} from "../../../../../types/Application";
import { getGuildMember } from "../../../../bot/getGuildMember";
import { logger } from "../../../../logger";

registerHook(
  "ApplicationEnd",
  async ({
    application,
    responses,
    owner,
    client,
  }: {
    application: Application;
    responses: {
      applicationId: string;
      startTime: Date;
      server: string;
      questionNumber: number;
      questions: ApplicationQuestion[];

      responses: { question: string; response: string }[];
    };
    owner: string;
    client: Client;
  }) => {
    const { addRolesWhenPending, removeRolesWhenPending } = application;
    const member = await getGuildMember(client, responses.server, owner);
    if (!member) return;

    await updateMemberRoles(
      client,
      member,
      addRolesWhenPending ?? [],
      removeRolesWhenPending ?? []
    );
  }
);

export async function updateMemberRoles(
  client: Client,
  member: GuildMember,
  rolesToAdd: string[],
  rolesToRemove: string[]
) {
  const guild = member.guild;
  const me = guild.members.me ?? (await guild.members.fetchMe());
  const botHighestRole = me.roles.highest;

  const canManage = (roleId: string) => {
    const role = guild.roles.cache.get(roleId);
    return role && botHighestRole.position > role.position && !role.managed;
  };

  const baseRoleIds = new Set<string>();
  for (const [roleId, role] of member.roles.cache) {
    if (roleId !== guild.id) {
      baseRoleIds.add(roleId);
    }
  }

  for (const roleId of rolesToAdd) {
    if (canManage(roleId)) baseRoleIds.add(roleId);
  }

  for (const roleId of rolesToRemove) {
    if (canManage(roleId)) baseRoleIds.delete(roleId);
  }

  const finalRoles = [...baseRoleIds];

  try {
    await member.roles.set(finalRoles);
  } catch (err) {
    logger("Hooks", "Warn", `Failed to update roles: ${err}`);
  }
}
