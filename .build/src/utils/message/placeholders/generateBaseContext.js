"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="92f45def-b973-581c-ba62-511532094510")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBasePlaceholderContext = generateBasePlaceholderContext;
function generateBasePlaceholderContext(options) {
    const { server, user, member, channel } = options;
    const context = {};
    if (options.server)
        context["server"] = {
            id: server.id,
            name: server.name,
            boosts: server.premiumSubscriptionCount || 0,
            members: server.memberCount,
        };
    if (options.user)
        context["user"] = {
            id: user.id,
            displayname: user.displayName,
            avatar: user.avatarURL() || "",
            username: user.username,
        };
    if (options.channel)
        context["channel"] = {
            id: channel.id,
            name: "name" in channel ? channel.name : "",
        };
    if (options.member) {
        const roles = member.roles.cache
            .filter((role) => role.id !== server.id)
            .map((role) => ({
            id: role.id,
            name: role.name,
        }));
        const highestRole = member.roles.highest;
        /**
         * .replace(new RegExp(/([*_~])/g), "\\$1")
         * can make it suit discord formatting
         */
        context["member"] = {
            nickname: member.nickname || user.displayName,
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
//# sourceMappingURL=/src/utils/message/placeholders/generateBaseContext.js.map
//# debugId=92f45def-b973-581c-ba62-511532094510
