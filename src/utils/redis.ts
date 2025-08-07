import Redis from "ioredis";
import logger from "./logger";

const redis = new Redis({
  host: process.env["REDIS_HOST"],
  port: parseInt(process.env["REDIS_PORT"]!, 10),
  password: process.env["REDIS_PASSWORD"],
});

redis
  .once("ready", () => logger.info("Redis ready"))
  .on("error", (err) => logger.error("Redis error", err))
  .on("close", () => logger.warn("Redis connection closed"))
  .on("connect", () => logger.info("Redis connected"));

export default redis;
