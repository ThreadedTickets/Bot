import config from "../../config";
import redis from "../redis";

export const invalidateCache = async (key: string) => {
  await redis.del(
    `${!key.includes("Creators:") ? config.redis.prefix : ""}${key}`
  );
};
