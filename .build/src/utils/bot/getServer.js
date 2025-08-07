"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="947dba6f-f7e5-5d3d-a282-4968978f90f6")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setServerLocale = exports.getServerLocale = exports.getServerResponder = exports.getUserTickets = exports.getTickets = exports.getUserCompletedApplications = exports.getCompletedApplications = exports.getTicketTrust = exports.getTicket = exports.getServerTag = exports.getServerTags = exports.getCompletedApplication = exports.getServerApplication = exports.getServerApplications = exports.getServerGroupsByIds = exports.getServerTicketTrigger = exports.getServerTicketTriggers = exports.getServerGroup = exports.getServerGroups = exports.getServerMessage = exports.getServerMessages = exports.getServer = void 0;
exports.getServerResponders = getServerResponders;
exports.findMatchingResponder = findMatchingResponder;
const re2_1 = __importDefault(require("re2"));
const __1 = require("../..");
const AutoResponder_1 = require("../../database/modals/AutoResponder");
const Guild_1 = require("../../database/modals/Guild");
const Tag_1 = require("../../database/modals/Tag");
const getCachedElse_1 = require("../database/getCachedElse");
const updateCache_1 = require("../database/updateCache");
const toTimeUnit_1 = require("../formatters/toTimeUnit");
const updateServerCache_1 = require("./updateServerCache");
const Panel_1 = require("../../database/modals/Panel");
const CompletedApplications_1 = require("../../database/modals/CompletedApplications");
const Ticket_1 = require("../../database/modals/Ticket");
const getServer = async (serverId) => {
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(`guilds:${serverId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 30), async () => await Guild_1.GuildSchema.findOneAndUpdate({ _id: serverId }, { $setOnInsert: { id: serverId } }, { upsert: true, new: true }), Guild_1.GuildSchema);
    return document;
};
exports.getServer = getServer;
const getServerMessages = async (serverId) => {
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(`messages:${serverId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 30), async () => await Guild_1.MessageSchema.find({ server: serverId }));
    return document;
};
exports.getServerMessages = getServerMessages;
const getServerMessage = async (messageId, serverId) => {
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(`message:${messageId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 5), async () => await Guild_1.MessageSchema.findOne({ _id: messageId, server: serverId }), Guild_1.MessageSchema);
    return document;
};
exports.getServerMessage = getServerMessage;
const getServerGroups = async (serverId) => {
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(`groups:${serverId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 30), async () => await Guild_1.GroupSchema.find({ server: serverId }));
    return document;
};
exports.getServerGroups = getServerGroups;
const getServerGroup = async (groupId, serverId) => {
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(`group:${groupId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 5), async () => await Guild_1.GroupSchema.findOne({ _id: groupId, server: serverId }), Guild_1.GroupSchema);
    return document;
};
exports.getServerGroup = getServerGroup;
const getServerTicketTriggers = async (serverId) => {
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(`ticketTriggers:${serverId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 30), async () => await Panel_1.TicketTriggerSchema.find({ server: serverId }));
    return document;
};
exports.getServerTicketTriggers = getServerTicketTriggers;
const getServerTicketTrigger = async (triggerId, serverId) => {
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(`ticketTrigger:${triggerId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 5), async () => await Panel_1.TicketTriggerSchema.findOne({
        _id: triggerId,
        server: serverId,
    }), Panel_1.TicketTriggerSchema);
    return document;
};
exports.getServerTicketTrigger = getServerTicketTrigger;
const getServerGroupsByIds = async (groupIds, serverId) => {
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(`group:${groupIds.join("|")}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 5), async () => await Guild_1.GroupSchema.find({ _id: { $in: groupIds }, server: serverId }));
    return document;
};
exports.getServerGroupsByIds = getServerGroupsByIds;
const getServerApplications = async (serverId) => {
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(`applications:${serverId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 30), async () => await Panel_1.ApplicationTriggerSchema.find({ server: serverId }));
    return document;
};
exports.getServerApplications = getServerApplications;
const getServerApplication = async (applicationId, serverId) => {
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(`application:${applicationId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 5), async () => await Panel_1.ApplicationTriggerSchema.findOne({
        _id: applicationId,
        server: serverId,
    }), Panel_1.ApplicationTriggerSchema);
    return document;
};
exports.getServerApplication = getServerApplication;
const getCompletedApplication = async (applicationId, owner) => {
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(`completedApps:${applicationId}:${owner}:all`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 5), async () => await CompletedApplications_1.CompletedApplicationSchema.findOne({
        _id: applicationId,
        owner: owner,
    }), CompletedApplications_1.CompletedApplicationSchema);
    return document;
};
exports.getCompletedApplication = getCompletedApplication;
const getServerTags = async (serverId) => {
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(`tags:${serverId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 30), async () => await Tag_1.TagSchema.find({ server: serverId }));
    return document;
};
exports.getServerTags = getServerTags;
const getServerTag = async (tagId, serverId) => {
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(`tag:${tagId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 5), async () => await Tag_1.TagSchema.findOne({ _id: tagId, server: serverId }), Tag_1.TagSchema);
    return document;
};
exports.getServerTag = getServerTag;
const getTicket = async (ticketId, serverId) => {
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(`ticket:${ticketId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 5), async () => await Ticket_1.TicketSchema.findOne({ _id: ticketId, server: serverId }), Ticket_1.TicketSchema);
    return document;
};
exports.getTicket = getTicket;
const getTicketTrust = async (ticketId) => {
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(`ticketTrust:${ticketId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 5), async () => await Ticket_1.TicketSchema.findOne({ _id: ticketId }), Ticket_1.TicketSchema);
    return document;
};
exports.getTicketTrust = getTicketTrust;
const getCompletedApplications = async (applicationId, status) => {
    const sortedStatus = status?.length ? [...status].sort() : [];
    const cacheKey = `completedApps:${applicationId}:${sortedStatus.length ? sortedStatus.join("|") : "all"}`;
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(cacheKey, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 0, 6), async () => await CompletedApplications_1.CompletedApplicationSchema.find({
        application: applicationId,
        ...(sortedStatus.length ? { status: { $in: sortedStatus } } : {}),
    }));
    return document;
};
exports.getCompletedApplications = getCompletedApplications;
const getUserCompletedApplications = async (applicationId, userId, status) => {
    const sortedStatus = status?.length ? [...status].sort() : [];
    const cacheKey = `completedApps:${applicationId}:${userId}:${sortedStatus.length ? sortedStatus.join("|") : "all"}`;
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(cacheKey, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 10), async () => await CompletedApplications_1.CompletedApplicationSchema.find({
        application: applicationId,
        owner: userId,
        ...(sortedStatus.length ? { status: { $in: sortedStatus } } : {}),
    }));
    return document;
};
exports.getUserCompletedApplications = getUserCompletedApplications;
const getTickets = async (serverId, status) => {
    const sortedStatus = status?.length ? [...status].sort() : [];
    const cacheKey = `tickets:${serverId}:${sortedStatus.length ? sortedStatus.join("|") : "all"}`;
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(cacheKey, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 0, 6), async () => await Ticket_1.TicketSchema.find({
        server: serverId,
        ...(sortedStatus.length ? { status: { $in: sortedStatus } } : {}),
    }));
    return document;
};
exports.getTickets = getTickets;
const getUserTickets = async (serverId, userId, status) => {
    const sortedStatus = status?.length ? [...status].sort() : [];
    const cacheKey = `tickets:${serverId}:${userId}:${sortedStatus.length ? sortedStatus.join("|") : "all"}`;
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(cacheKey, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 0, 1), async () => await Ticket_1.TicketSchema.find({
        server: serverId,
        owner: userId,
        ...(sortedStatus.length ? { status: { $in: sortedStatus } } : {}),
    }));
    return document;
};
exports.getUserTickets = getUserTickets;
async function getServerResponders(serverId, useInMemCache) {
    const cacheKey = `responders:${serverId}`;
    if (useInMemCache && __1.InMemoryCache.has(cacheKey)) {
        return __1.InMemoryCache.get(cacheKey);
    }
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(cacheKey, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 30), async () => await AutoResponder_1.AutoResponderSchema.find({ server: serverId }));
    const mapped = document.map((d) => ({
        matcherType: d.matcherType,
        matcherScope: d.matcherScope,
        matcher: d.matcher,
        message: d.message,
    }));
    __1.InMemoryCache.set(cacheKey, mapped);
    if (useInMemCache)
        return mapped;
    return document;
}
const getServerResponder = async (responderId, serverId) => {
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(`responder:${responderId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 5), async () => await AutoResponder_1.AutoResponderSchema.findOne({ _id: responderId, server: serverId }), AutoResponder_1.AutoResponderSchema);
    return document;
};
exports.getServerResponder = getServerResponder;
function findMatchingResponder(content, responders) {
    const normalize = (str, scope) => {
        let result = str;
        if (scope.clear)
            result = result.replace(/[\W_]+/g, "").toLowerCase();
        if (scope.normalize)
            result = result.toLowerCase();
        return result;
    };
    const priority = [
        "exact",
        "starts",
        "ends",
        "includes",
        "regex",
    ];
    for (const type of priority) {
        for (const responder of responders) {
            if (responder.matcherType !== type)
                continue;
            const input = normalize(content, responder.matcherScope);
            const pattern = normalize(responder.matcher, responder.matcherScope);
            switch (type) {
                case "exact":
                    if (input === pattern)
                        return responder;
                    break;
                case "starts":
                    if (input.startsWith(pattern))
                        return responder;
                    break;
                case "ends":
                    if (input.endsWith(pattern))
                        return responder;
                    break;
                case "includes":
                    if (input.includes(pattern))
                        return responder;
                    break;
                case "regex":
                    try {
                        const regex = new re2_1.default(responder.matcher, "i");
                        if (regex.test(content))
                            return responder;
                    }
                    catch {
                        // Invalid regex; skip this responder
                    }
                    break;
            }
        }
    }
    return undefined;
}
const getServerLocale = async (serverId) => {
    const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(`locale:${serverId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 0, 6), async () => {
        return { locale: (await (0, exports.getServer)(serverId)).preferredLanguage };
    });
    return document.locale;
};
exports.getServerLocale = getServerLocale;
const setServerLocale = async (serverId, locale) => {
    // Update in the DB
    const server = await (0, exports.getServer)(serverId);
    server.preferredLanguage = locale;
    await server.save();
    // Update in the cache
    await (0, updateServerCache_1.updateServerCache)(serverId, server);
    (0, updateCache_1.updateCachedData)(`locale:${serverId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 0, 6), {
        locale: locale,
    });
};
exports.setServerLocale = setServerLocale;
//# sourceMappingURL=getServer.js.map
//# debugId=947dba6f-f7e5-5d3d-a282-4968978f90f6
