"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="018e2270-1894-5b88-88b7-e21d89dbcb49")}catch(e){}}();

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
//# sourceMappingURL=roles.js.map
//# debugId=018e2270-1894-5b88-88b7-e21d89dbcb49
