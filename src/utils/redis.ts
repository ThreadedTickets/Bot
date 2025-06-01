import Redis from "ioredis";
import { logger } from "./logger";

const redis = new Redis({
  host: process.env["REDIS_HOST"],
  port: parseInt(process.env["REDIS_PORT"]!, 10),
  password: process.env["REDIS_PASSWORD"],
});

redis
  .once("ready", () => logger("Redis", "Info", "Redis ready"))
  .on("error", (err) => logger("Redis", "Error", err.message))
  .on("close", () => logger("Redis", "Warn", "Redis connection closed"))
  .on("connect", () => logger("Redis", "Info", "Redis connected"));

export default redis;
