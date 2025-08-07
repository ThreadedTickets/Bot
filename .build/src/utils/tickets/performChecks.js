"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="9715fc19-7d31-57f4-a0df-a48b71141f1c")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.performTicketChecks = performTicketChecks;
exports.canCreateTicketTarget = canCreateTicketTarget;
const discord_js_1 = require("discord.js");
const getServer_1 = require("../bot/getServer");
async function performTicketChecks(trigger, member) {
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
    const openTickets = await (0, getServer_1.getTickets)(trigger.server, ["Open"]);
    if (serverLimit > 0 && openTickets.length >= serverLimit)
        return {
            allowed: false,
            error: "2003",
        };
    // User-specific applications
    const userOpenTickets = await (0, getServer_1.getUserTickets)(trigger.server, member.id, [
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
async function canCreateTicketTarget(guild, type, parentId) {
    // Check guild-wide channel limit
    const allChannels = await guild.channels.fetch();
    const totalChannels = allChannels.size;
    if (type === "channel" && totalChannels >= 500) {
        return {
            allowed: false,
            error: "2005",
        };
    }
    let parent = null;
    if (parentId) {
        try {
            parent = await guild.channels.fetch(parentId);
        }
        catch {
            return { allowed: false, error: "2006" };
        }
        if (!parent) {
            return { allowed: false, error: "2007" };
        }
    }
    // If creating a channel inside a category
    if (type === "channel" && parent?.type === discord_js_1.ChannelType.GuildCategory) {
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
        if (!parent || parent.type !== discord_js_1.ChannelType.GuildText) {
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
    const permissions = guild.members.me?.permissions;
    if (type === "channel" &&
        !permissions?.has(discord_js_1.PermissionsBitField.Flags.ManageChannels)) {
        return { allowed: false, error: "2012" };
    }
    return { allowed: true };
}
//# sourceMappingURL=performChecks.js.map
//# debugId=9715fc19-7d31-57f4-a0df-a48b71141f1c
