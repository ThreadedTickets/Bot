import mongoose from "mongoose";
import { cacheHits, cacheMisses, databaseRequests } from "../../metricsServer";
import redis from "../redis";
import config from "../../config";

/**
 * Get cached data from Redis or compute and cache it if not found.
 */
export const getCachedDataElse = async <T>(
  key: string,
  ttl: number,
  functionIfNotFound: () => Promise<T>,
  hydrateModel?: mongoose.Model<any>
): Promise<{ cached: boolean; data: any }> => {
  databaseRequests.inc();

  const cached = await redis.get(`${config.redis.prefix}${key}`);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      cacheHits.inc();

      if (parsed === null) {
        return { cached: true, data: null };
      }

      const data = hydrateModel ? hydrateModel.hydrate(parsed) : parsed;
      return { cached: true, data };
    } catch (e) {
      console.warn(`Failed to parse cached data for key "${key}":`, e);
      await redis.del(`${config.redis.prefix}${key}`);
    }
  }

  const functionResult = await functionIfNotFound();

  if (functionResult !== undefined) {
    await redis.set(
      `${config.redis.prefix}${key}`,
      JSON.stringify(functionResult),
      "EX",
      ttl
    );
  }

  cacheMisses.inc();
  return {
    cached: false,
    data: functionResult,
  };
};

/**
 * Get cached data only, no fallback logic.
 */
export const getCache = async (
  key: string,
  hydrateModel?: mongoose.Model<any>
): Promise<{ cached: boolean; data: any }> => {
  const cached = await redis.get(`${config.redis.prefix}${key}`);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      cacheHits.inc();

      if (parsed === null) {
        return { cached: true, data: null };
      }

      const data = hydrateModel ? hydrateModel.hydrate(parsed) : parsed;
      return { cached: true, data };
    } catch (e) {
      console.warn(`Failed to parse cache for key "${key}":`, e);
      await redis.del(`${config.redis.prefix}${key}`);
    }
  }

  return {
    cached: false,
    data: null,
  };
};
