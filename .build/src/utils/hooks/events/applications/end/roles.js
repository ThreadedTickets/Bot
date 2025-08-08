"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMemberRoles = updateMemberRoles;
const __1 = require("../../..");
const getGuildMember_1 = require("../../../../bot/getGuildMember");
const logger_1 = __importDefault(require("../../../../logger"));
(0, __1.registerHook)("ApplicationEnd", async ({ application, responses, owner, client, }) => {
    const { addRolesWhenPending, removeRolesWhenPending } = application;
    const member = await (0, getGuildMember_1.getGuildMember)(client, responses.server, owner);
    if (!member)
        return;
    await updateMemberRoles(client, member, addRolesWhenPending ?? [], removeRolesWhenPending ?? []);
});
async function updateMemberRoles(client, member, rolesToAdd, rolesToRemove) {
    const guild = member.guild;
    const me = guild.members.me ?? (await guild.members.fetchMe());
    const botHighestRole = me.roles.highest;
    const canManage = (roleId) => {
        const role = guild.roles.cache.get(roleId);
        return role && botHighestRole.position > role.position && !role.managed;
    };
    const baseRoleIds = new Set();
    for (const [roleId, role] of member.roles.cache) {
        if (roleId !== guild.id) {
            baseRoleIds.add(roleId);
        }
    }
    for (const roleId of rolesToAdd) {
        if (canManage(roleId))
            baseRoleIds.add(roleId);
    }
    for (const roleId of rolesToRemove) {
        if (canManage(roleId))
            baseRoleIds.delete(roleId);
    }
    const finalRoles = [...baseRoleIds];
    try {
        await member.roles.set(finalRoles);
    }
    catch (err) {
        logger_1.default.warn(`Failed to update roles from application`, err);
    }
}
//# sourceMappingURL=/src/utils/hooks/events/applications/end/roles.js.map