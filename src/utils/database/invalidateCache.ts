import config from "../../config";
import redis from "../redis";

export const invalidateCache = async (key: string) => {
  await redis.del(`${config.redis.prefix}${key}`);
};
