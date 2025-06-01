import { Client, Guild, Interaction, Message, User } from "discord.js";
import { registerHook } from "../../..";
import { getGuildMember } from "../../../../bot/getGuildMember";
import { TicketFormResponse, TicketTrigger } from "../../../../../types/Ticket";
import { Locale } from "../../../../../types/Locale";
import { updateMemberRoles } from "../../applications/end/roles";

registerHook(
  "TicketCreate",
  async ({
    trigger,
    guild,
    owner,
    responses,
    messageOrInteraction,
    client,
    lang,
    user,
  }: {
    client: Client;
    trigger: TicketTrigger;
    guild: Guild;
    responses: TicketFormResponse[];
    owner: string;
    messageOrInteraction: Message | Interaction;
    lang: Locale;
    user: User;
  }) => {
    const { addRolesOnOpen, removeRolesOnOpen } = trigger;
    const member = await getGuildMember(client, guild.id, owner);
    if (!member) return;

    await updateMemberRoles(
      client,
      member,
      addRolesOnOpen ?? [],
      removeRolesOnOpen ?? []
    );
  }
);
