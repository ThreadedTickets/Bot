import { logger } from "../logger";
import redis from "../redis";

/**
 * Update cached data in Redis by recomputing it.
 *
 * @param key The Redis key to update
 * @param ttl The time to cache the result for in seconds
 * @param data The new data
 * @returns True if the data was successfully cached, otherwise false
 */
export const updateCachedData = async (key: string, ttl: number, data: any): Promise<boolean> => {
  try {
    await redis.set(key, JSON.stringify(data), "EX", ttl);
    return true;
  } catch (error) {
    logger("Redis", "Error", `${error}`);
    return false;
  }
};
