import redis from "../redis";

export const invalidateCache = async (key: string) => {
  await redis.del(key);
};
