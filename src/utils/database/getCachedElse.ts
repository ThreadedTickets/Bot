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
    try {
      const parsed = JSON.parse(cached);
      if (parsed === null) {
        cacheHits.inc();
        return {
          cached: true,
          data: parsed,
        };
      }

      cacheHits.inc();
      return {
        cached: true,
        data: hydrateModel ? hydrateModel.hydrate(parsed) : (parsed as T),
      };
    } catch (e) {
      console.warn(`Failed to parse cached data for key "${key}":`, e);
      // Optional: you could delete the corrupt key if you want to regenerate it
      await redis.del(key);
    }
  }

  // Fallback: not in cache or parsing failed
  const functionResult = await functionIfNotFound();

  // Store result if it's not undefined
  if (functionResult !== undefined) {
    await redis.set(key, JSON.stringify(functionResult), "EX", ttl);
  }

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
    try {
      const parsed = JSON.parse(cached);
      if (parsed === null) {
        cacheHits.inc();
        return { cached: true, data: parsed };
      }

      cacheHits.inc();
      return {
        cached: true,
        data: hydrateModel ? hydrateModel.hydrate(parsed) : parsed,
      };
    } catch (e) {
      console.warn(`Failed to parse cache for key "${key}":`, e);
      await redis.del(key);
    }
  }

  return {
    cached: false,
    data: null,
  };
};
