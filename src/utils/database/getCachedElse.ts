import mongoose from "mongoose";
import { cacheHits, cacheMisses, databaseRequests } from "../../metricsServer";
import redis from "../redis";

/**
 * Get cached data from Redis or compute and cache it if not found.
 *
 * @param key The Redis key to search
 * @param ttl The time to cache the result for in seconds
 * @param functionIfNotFound A function to run if the data requested is not found in cache
 * @returns The data and whether it was from cache or not
 */
export const getCachedDataElse = async <T>(
  key: string,
  ttl: number,
  functionIfNotFound: () => Promise<T>,
  hydrateModel?: mongoose.Model<any>
): Promise<{ cached: boolean; data: T }> => {
  databaseRequests.inc();
  const cached = await redis.get(key);
  if (cached) {
    cacheHits.inc();
    const parsed = JSON.parse(cached);
    return {
      cached: true,
      data: hydrateModel ? hydrateModel.hydrate(parsed) : (parsed as T),
    };
  }

  const functionResult = await functionIfNotFound();
  await redis.set(key, JSON.stringify(functionResult), "EX", ttl);
  cacheMisses.inc();

  return {
    cached: false,
    data: functionResult,
  };
};

export const getCache = async (
  key: string,
  hydrateModel?: mongoose.Model<any>
): Promise<{ cached: boolean; data: string | null }> => {
  const cached = await redis.get(key);
  if (cached) {
    cacheHits.inc();
    const parsed = cached;
    return {
      cached: true,
      data: hydrateModel ? hydrateModel.hydrate(parsed) : (parsed as string),
    };
  }

  return {
    cached: false,
    data: null,
  };
};
