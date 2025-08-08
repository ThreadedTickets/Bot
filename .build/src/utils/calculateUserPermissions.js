"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b3ffc9c2-99b8-541e-ac18-d4931253ed36")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPermissions = getUserPermissions;
const discord_js_1 = require("discord.js");
function defaultPermissions() {
    return {
        tickets: {
            canClose: false,
            canCloseIfOwn: false,
            canForceOpen: false,
            canMove: false,
            canLock: false,
            canUnlock: false,
            canViewTranscripts: false,
            canViewLockedTranscripts: false,
            channelPermissions: {
                allow: 0n,
                deny: 0n,
            },
        },
        tags: {
            create: false,
            edit: false,
            delete: false,
        },
        messages: {
            create: false,
            edit: false,
            delete: false,
        },
        autoResponders: {
            create: false,
            edit: false,
            delete: false,
        },
        applications: {
            manage: false,
            respond: false,
        },
        panels: {
            manage: false,
        },
    };
}
function getUserPermissions(member, groups) {
    const userRoles = new Set(member.roles.cache.map((r) => r.id));
    const userId = member.id;
    const merged = defaultPermissions();
    for (const group of groups) {
        const isInGroup = group.roles.some((r) => userRoles.has(r)) ||
            group.extraMembers.includes(userId);
        if (!isInGroup)
            continue;
        const perms = group.permissions;
        // Tickets
        if (perms.tickets) {
            const t = perms.tickets;
            if (t.canClose)
                merged.tickets.canClose = true;
            if (t.canCloseIfOwn)
                merged.tickets.canCloseIfOwn = true;
            if (t.canForceOpen)
                merged.tickets.canForceOpen = true;
            if (t.canMove)
                merged.tickets.canMove = true;
            if (t.canLock)
                merged.tickets.canLock = true;
            if (t.canUnlock)
                merged.tickets.canUnlock = true;
            if (t.canViewTranscripts)
                merged.tickets.canViewTranscripts = true;
            if (t.canViewLockedTranscripts)
                merged.tickets.canViewLockedTranscripts = true;
            if (t.channelPermissions) {
                // Initialize the permission flags as numbers (bitwise flags)
                let allowFlags = 0n;
                let denyFlags = 0n;
                // Add to allowFlags from the incoming `allow` list
                for (const perm of t.channelPermissions.allow || []) {
                    allowFlags |=
                        discord_js_1.PermissionFlagsBits[perm];
                }
                // Add to denyFlags from the incoming `deny` list
                for (const perm of t.channelPermissions.deny || []) {
                    denyFlags |=
                        discord_js_1.PermissionFlagsBits[perm];
                }
                // Remove deny permissions from allow if they're in both
                allowFlags &= ~denyFlags;
                // Update the merged ticket permissions with the calculated flags
                merged.tickets.channelPermissions.allow = allowFlags;
                merged.tickets.channelPermissions.deny = denyFlags;
            }
        }
        // Tags
        if (perms.tags) {
            const t = perms.tags;
            if (t.create)
                merged.tags.create = true;
            if (t.edit)
                merged.tags.edit = true;
            if (t.delete)
                merged.tags.delete = true;
        }
        // Messages
        if (perms.messages) {
            const m = perms.messages;
            if (m.create)
                merged.messages.create = true;
            if (m.edit)
                merged.messages.edit = true;
            if (m.delete)
                merged.messages.delete = true;
        }
        // AutoResponders
        if (perms.autoResponders) {
            const a = perms.autoResponders;
            if (a.create)
                merged.autoResponders.create = true;
            if (a.edit)
                merged.autoResponders.edit = true;
            if (a.delete)
                merged.autoResponders.delete = true;
        }
        // Applications
        if (perms.applications) {
            const a = perms.applications;
            if (a.manage)
                merged.applications.manage = true;
            if (a.respond)
                merged.applications.respond = true;
        }
        // Panels
        if (perms.panels) {
            const a = perms.panels;
            if (a.manage)
                merged.panels.manage = true;
        }
    }
    return {
        ...merged,
        tickets: {
            ...merged.tickets,
            channelPermissions: {
                allow: merged.tickets.channelPermissions.allow,
                deny: merged.tickets.channelPermissions.deny,
            },
        },
    };
}
//# sourceMappingURL=/src/utils/calculateUserPermissions.js.map
//# debugId=b3ffc9c2-99b8-541e-ac18-d4931253ed36
