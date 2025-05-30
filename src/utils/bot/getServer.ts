import RE2 from "re2";
import { InMemoryCache } from "../..";
import { AutoResponderSchema } from "../../database/modals/AutoResponder";
import {
  GroupSchema,
  GuildSchema,
  MessageSchema,
} from "../../database/modals/Guild";
import { TagSchema } from "../../database/modals/Tag";
import { Locale } from "../../types/Locale";
import { getCachedDataElse } from "../database/getCachedElse";
import { updateCachedData } from "../database/updateCache";
import { toTimeUnit } from "../formatters/toTimeUnit";
import { updateServerCache } from "./updateServerCache";
import {
  ApplicationTriggerSchema,
  TicketTriggerSchema,
} from "../../database/modals/Panel";
import { CompletedApplicationSchema } from "../../database/modals/CompletedApplications";
import { TicketSchema } from "../../database/modals/Ticket";

export const getServer = async (serverId: string) => {
  const { data: document } = await getCachedDataElse(
    `guilds:${serverId}`,
    toTimeUnit("seconds", 0, 30),
    async () =>
      await GuildSchema.findOneAndUpdate(
        { _id: serverId },
        { $setOnInsert: { id: serverId } },
        { upsert: true, new: true }
      ),
    GuildSchema
  );

  return document;
};

export const getServerMessages = async (serverId: string) => {
  const { data: document } = await getCachedDataElse(
    `messages:${serverId}`,
    toTimeUnit("seconds", 0, 30),
    async () => await MessageSchema.find({ server: serverId })
  );

  return document;
};

export const getServerMessage = async (messageId: string, serverId: string) => {
  const { data: document } = await getCachedDataElse(
    `message:${messageId}`,
    toTimeUnit("seconds", 0, 5),
    async () =>
      await MessageSchema.findOne({ _id: messageId, server: serverId }),
    MessageSchema
  );

  return document;
};

export const getServerGroups = async (serverId: string) => {
  const { data: document } = await getCachedDataElse(
    `groups:${serverId}`,
    toTimeUnit("seconds", 0, 30),
    async () => await GroupSchema.find({ server: serverId })
  );

  return document;
};

export const getServerGroup = async (groupId: string, serverId: string) => {
  const { data: document } = await getCachedDataElse(
    `group:${groupId}`,
    toTimeUnit("seconds", 0, 5),
    async () => await GroupSchema.findOne({ _id: groupId, server: serverId }),
    GroupSchema
  );

  return document;
};

export const getServerTicketTriggers = async (serverId: string) => {
  const { data: document } = await getCachedDataElse(
    `ticketTriggers:${serverId}`,
    toTimeUnit("seconds", 0, 30),
    async () => await TicketTriggerSchema.find({ server: serverId })
  );

  return document;
};

export const getServerTicketTrigger = async (
  triggerId: string,
  serverId: string
) => {
  const { data: document } = await getCachedDataElse(
    `ticketTrigger:${triggerId}`,
    toTimeUnit("seconds", 0, 5),
    async () =>
      await TicketTriggerSchema.findOne({
        _id: triggerId,
        server: serverId,
      }),
    TicketTriggerSchema
  );

  return document;
};

export const getServerGroupsByIds = async (
  groupIds: string[],
  serverId: string
) => {
  const { data: document } = await getCachedDataElse(
    `group:${groupIds.join("|")}`,
    toTimeUnit("seconds", 0, 5),
    async () =>
      await GroupSchema.find({ _id: { $in: groupIds }, server: serverId })
  );

  return document;
};

export const getServerApplications = async (serverId: string) => {
  const { data: document } = await getCachedDataElse(
    `applications:${serverId}`,
    toTimeUnit("seconds", 0, 30),
    async () => await ApplicationTriggerSchema.find({ server: serverId })
  );

  return document;
};

export const getServerApplication = async (
  applicationId: string,
  serverId: string
) => {
  const { data: document } = await getCachedDataElse(
    `application:${applicationId}`,
    toTimeUnit("seconds", 0, 5),
    async () =>
      await ApplicationTriggerSchema.findOne({
        _id: applicationId,
        server: serverId,
      }),
    ApplicationTriggerSchema
  );

  return document;
};

export const getCompletedApplication = async (
  applicationId: string,
  owner: string
) => {
  const { data: document } = await getCachedDataElse(
    `completedApps:${applicationId}:${owner}:all`,
    toTimeUnit("seconds", 0, 5),
    async () =>
      await CompletedApplicationSchema.findOne({
        _id: applicationId,
        owner: owner,
      }),
    CompletedApplicationSchema
  );

  return document;
};

export const getServerTags = async (serverId: string) => {
  const { data: document } = await getCachedDataElse(
    `tags:${serverId}`,
    toTimeUnit("seconds", 0, 30),
    async () => await TagSchema.find({ server: serverId })
  );

  return document;
};

export const getServerTag = async (tagId: string, serverId: string) => {
  const { data: document } = await getCachedDataElse(
    `tag:${tagId}`,
    toTimeUnit("seconds", 0, 5),
    async () => await TagSchema.findOne({ _id: tagId, server: serverId }),
    TagSchema
  );

  return document;
};

export const getTicket = async (ticketId: string, serverId: string) => {
  const { data: document } = await getCachedDataElse(
    `ticket:${ticketId}`,
    toTimeUnit("seconds", 0, 5),
    async () => await TicketSchema.findOne({ _id: ticketId, server: serverId }),
    TicketSchema
  );

  return document;
};

export const getTicketTrust = async (ticketId: string) => {
  const { data: document } = await getCachedDataElse(
    `ticketTrust:${ticketId}`,
    toTimeUnit("seconds", 0, 5),
    async () => await TicketSchema.findOne({ _id: ticketId }),
    TicketSchema
  );

  return document;
};

export const getCompletedApplications = async (
  applicationId: string,
  status?: ("Pending" | "Accepted" | "Rejected")[]
) => {
  const sortedStatus = status?.length ? [...status].sort() : [];
  const cacheKey = `completedApps:${applicationId}:${
    sortedStatus.length ? sortedStatus.join("|") : "all"
  }`;

  const { data: document } = await getCachedDataElse(
    cacheKey,
    toTimeUnit("seconds", 0, 0, 6),
    async () =>
      await CompletedApplicationSchema.find({
        application: applicationId,
        ...(sortedStatus.length ? { status: { $in: sortedStatus } } : {}),
      })
  );

  return document;
};

export const getUserCompletedApplications = async (
  applicationId: string,
  userId: string,
  status?: ("Pending" | "Accepted" | "Rejected")[]
) => {
  const sortedStatus = status?.length ? [...status].sort() : [];
  const cacheKey = `completedApps:${applicationId}:${userId}:${
    sortedStatus.length ? sortedStatus.join("|") : "all"
  }`;

  const { data: document } = await getCachedDataElse(
    cacheKey,
    toTimeUnit("seconds", 0, 10),
    async () =>
      await CompletedApplicationSchema.find({
        application: applicationId,
        owner: userId,
        ...(sortedStatus.length ? { status: { $in: sortedStatus } } : {}),
      })
  );

  return document;
};

export const getTickets = async (
  serverId: string,
  status?: ("Open" | "Closed" | "Locked")[]
) => {
  const sortedStatus = status?.length ? [...status].sort() : [];
  const cacheKey = `tickets:${serverId}:${
    sortedStatus.length ? sortedStatus.join("|") : "all"
  }`;

  const { data: document } = await getCachedDataElse(
    cacheKey,
    toTimeUnit("seconds", 0, 0, 6),
    async () =>
      await TicketSchema.find({
        server: serverId,
        ...(sortedStatus.length ? { status: { $in: sortedStatus } } : {}),
      })
  );

  return document;
};

export const getUserTickets = async (
  serverId: string,
  userId: string,
  status?: ("Open" | "Closed" | "Locked")[]
) => {
  const sortedStatus = status?.length ? [...status].sort() : [];
  const cacheKey = `tickets:${serverId}:${userId}:${
    sortedStatus.length ? sortedStatus.join("|") : "all"
  }`;

  const { data: document } = await getCachedDataElse(
    cacheKey,
    toTimeUnit("seconds", 0, 0, 1),
    async () =>
      await TicketSchema.find({
        server: serverId,
        owner: userId,
        ...(sortedStatus.length ? { status: { $in: sortedStatus } } : {}),
      })
  );

  return document;
};

type MatcherType = "exact" | "includes" | "starts" | "ends" | "regex";

type MappedResponder = {
  matcherType: MatcherType;
  matcherScope: {
    clear: boolean;
    normalize: boolean;
  };
  matcher: string;
  message: string;
};

export function getServerResponders(
  serverId: string,
  useInMemCache: true
): Promise<MappedResponder[]>;
export function getServerResponders(
  serverId: string,
  useInMemCache?: false
): Promise<(typeof AutoResponderSchema.prototype)[]>;

export async function getServerResponders(
  serverId: string,
  useInMemCache?: boolean
) {
  const cacheKey = `responders:${serverId}`;

  if (useInMemCache && InMemoryCache.has(cacheKey)) {
    return InMemoryCache.get(cacheKey) as MappedResponder[];
  }

  const { data: document } = await getCachedDataElse(
    cacheKey,
    toTimeUnit("seconds", 0, 30),
    async () => await AutoResponderSchema.find({ server: serverId })
  );

  const mapped = document.map((d) => ({
    matcherType: d.matcherType,
    matcherScope: d.matcherScope,
    matcher: d.matcher,
    message: d.message,
  }));

  InMemoryCache.set(cacheKey, mapped);
  if (useInMemCache) return mapped;

  return document;
}

export const getServerResponder = async (
  responderId: string,
  serverId: string
) => {
  const { data: document } = await getCachedDataElse(
    `responder:${responderId}`,
    toTimeUnit("seconds", 0, 5),
    async () =>
      await AutoResponderSchema.findOne({ _id: responderId, server: serverId }),
    AutoResponderSchema
  );

  return document;
};

export function findMatchingResponder(
  content: string,
  responders: MappedResponder[]
): MappedResponder | undefined {
  const normalize = (str: string, scope: MappedResponder["matcherScope"]) => {
    let result = str;
    if (scope.clear) result = result.replace(/[\W_]+/g, "").toLowerCase();
    if (scope.normalize) result = result.toLowerCase();
    return result;
  };

  const priority: MatcherType[] = [
    "exact",
    "starts",
    "ends",
    "includes",
    "regex",
  ];

  for (const type of priority) {
    for (const responder of responders) {
      if (responder.matcherType !== type) continue;

      const input = normalize(content, responder.matcherScope);
      const pattern = normalize(responder.matcher, responder.matcherScope);

      switch (type) {
        case "exact":
          if (input === pattern) return responder;
          break;
        case "starts":
          if (input.startsWith(pattern)) return responder;
          break;
        case "ends":
          if (input.endsWith(pattern)) return responder;
          break;
        case "includes":
          if (input.includes(pattern)) return responder;
          break;
        case "regex":
          try {
            const regex = new RE2(responder.matcher, "i");
            if (regex.test(content)) return responder;
          } catch {
            // Invalid regex; skip this responder
          }
          break;
      }
    }
  }

  return undefined;
}

export const getServerLocale = async (serverId: string) => {
  const { data: document } = await getCachedDataElse(
    `locale:${serverId}`,
    toTimeUnit("seconds", 0, 0, 6),
    async () => {
      return { locale: (await getServer(serverId)).preferredLanguage };
    }
  );

  return document.locale;
};

export const setServerLocale = async (serverId: string, locale: Locale) => {
  // Update in the DB
  const server = await getServer(serverId);
  server.preferredLanguage = locale;
  await server.save();

  // Update in the cache
  await updateServerCache(serverId, server);
  updateCachedData(`locale:${serverId}`, toTimeUnit("seconds", 0, 0, 6), {
    locale: locale,
  });
};
