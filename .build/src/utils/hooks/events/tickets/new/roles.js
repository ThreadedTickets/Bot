"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../..");
const getGuildMember_1 = require("../../../../bot/getGuildMember");
const roles_1 = require("../../applications/end/roles");
(0, __1.registerHook)("TicketCreate", async ({ trigger, guild, owner, responses, messageOrInteraction, client, lang, user, }) => {
    const { addRolesOnOpen, removeRolesOnOpen } = trigger;
    const member = await (0, getGuildMember_1.getGuildMember)(client, guild.id, owner);
    if (!member)
        return;
    await (0, roles_1.updateMemberRoles)(client, member, addRolesOnOpen ?? [], removeRolesOnOpen ?? []);
});
//# sourceMappingURL=/src/utils/hooks/events/tickets/new/roles.js.map