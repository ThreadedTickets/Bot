"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b17ec119-c48f-5be9-9021-711b67154b59")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.performApplicationChecks = performApplicationChecks;
const getServer_1 = require("../bot/getServer");
const getCachedElse_1 = require("../database/getCachedElse");
/**
 *
 * @param application
 * @param member
 * @returns
 * Error 1001: User has blacklisted role
 *
 * Error 1002: User doesn't have all required roles
 *
 * Error 1003: Application limit (all users) has been reached
 *
 * Error 1004: User at application limit
 *
 * Error 1005: User on cooldown
 *
 * Error 1006: Application is not currently accepting responses
 *
 * Error 1007: Other active application
 */
async function performApplicationChecks(application, member, checkForActiveApplications, includeRoles) {
    const { allowedAttempts, blacklistRoles, requiredRoles, applicationLimit, applicationCooldown, acceptingResponses, open, close, } = application;
    if (checkForActiveApplications &&
        (await (0, getCachedElse_1.getCache)(`runningApplications:${member.id}`)).cached)
        return {
            allowed: false,
            error: "1007",
        };
    const now = Date.now();
    const openTime = open ? new Date(open).getTime() : null;
    const closeTime = close ? new Date(close).getTime() : null;
    // Time window checks (Error 6)
    if (openTime && closeTime && !acceptingResponses) {
        if (!(now >= openTime && now <= closeTime)) {
            return { allowed: false, error: "1006" };
        }
    }
    else if (closeTime && acceptingResponses) {
        if (now > closeTime) {
            return { allowed: false, error: "1006" };
        }
    }
    else if (openTime && !acceptingResponses) {
        if (now < openTime) {
            return { allowed: false, error: "1006" };
        }
    }
    else if (!openTime && !closeTime && !acceptingResponses) {
        return { allowed: false, error: "1006" };
    }
    // Role checks
    // Blacklist role check
    if (includeRoles && "roles" in member) {
        if (blacklistRoles.length > 0 &&
            member.roles.cache.hasAny(...blacklistRoles)) {
            return {
                allowed: false,
                error: "1001",
            };
        }
    }
    // Required roles check
    if (includeRoles && "roles" in member) {
        if (requiredRoles.length > 0 &&
            !member.roles.cache.hasAll(...requiredRoles)) {
            return {
                allowed: false,
                error: "1002",
            };
        }
    }
    // Global application limit (Pending only)
    const completedApplications = await (0, getServer_1.getCompletedApplications)(application._id, ["Pending"]);
    if (applicationLimit > 0 && completedApplications.length >= applicationLimit)
        return {
            allowed: false,
            error: "1003",
        };
    // User-specific applications
    const userCompletedApplications = await (0, getServer_1.getUserCompletedApplications)(application._id, member.id);
    const userPending = userCompletedApplications.filter((a) => a.status === "Pending");
    if (allowedAttempts > 0 && userPending.length >= allowedAttempts) {
        return {
            allowed: false,
            error: "1004",
        };
    }
    // Cooldown (non-pending only)
    if (applicationCooldown > 0) {
        const cooldownMs = applicationCooldown * 60 * 1000;
        const recentCompleted = userCompletedApplications.find((a) => a.status !== "Pending" &&
            a.closedAt &&
            now - new Date(a.closedAt).getTime() < cooldownMs);
        if (recentCompleted) {
            return {
                allowed: false,
                error: "1005",
            };
        }
    }
    return {
        allowed: true,
        error: null,
    };
}
//# sourceMappingURL=/src/utils/applications/performChecks.js.map
//# debugId=b17ec119-c48f-5be9-9021-711b67154b59
