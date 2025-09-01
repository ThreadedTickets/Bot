import "@dotenvx/dotenvx";
import { CacheWithLimitsOptions } from "discord.js";

export default {
  client: {
    token: process.env["DISCORD_TOKEN"] ?? null,
    cache: {} as CacheWithLimitsOptions,
  },

  prefix: process.env["PREFIX"] ?? ">",
  isWhiteLabel: process.env["IS_WHITELABEL"] === "true",
  whiteLabelServerIds: (process.env["WHITELABEL_SERVER_IDS"] ?? "")
    .split(", ")
    .filter(Boolean),

  mongoose: {
    uri: process.env["MONGOOSE_URI"] ?? null,
    username: process.env["MONGOOSE_USERNAME"] ?? null,
    password: process.env["MONGOOSE_PASSWORD"] ?? null,
  },

  api: {
    token: process.env["API_TOKEN"] ?? "",
    port: parseInt(process.env["API_PORT"] ?? "", 10),
  },

  redis: {
    host: process.env["REDIS_HOST"] ?? null,
    port: parseInt(process.env["REDIS_PORT"] ?? "", 10),
    password: process.env["REDIS_PASSWORD"] ?? "",
    prefix: process.env["REDIS_PREFIX"] ?? "",
  },

  owner: process.env["DISCORD_OWNER"] ?? "",
  admins: (process.env["DISCORD_ADMINS"] ?? "").split(", "),
} as const;
