"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="4babf7c7-0a0d-5d32-a10c-936b27a75f2e")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCache = exports.getCachedDataElse = void 0;
const metricsServer_1 = require("../../metricsServer");
const redis_1 = __importDefault(require("../redis"));
/**
 * Get cached data from Redis or compute and cache it if not found.
 */
const getCachedDataElse = async (key, ttl, functionIfNotFound, hydrateModel) => {
    metricsServer_1.databaseRequests.inc();
    const cached = await redis_1.default.get(key);
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            metricsServer_1.cacheHits.inc();
            if (parsed === null) {
                return { cached: true, data: null };
            }
            const data = hydrateModel ? hydrateModel.hydrate(parsed) : parsed;
            return { cached: true, data };
        }
        catch (e) {
            console.warn(`Failed to parse cached data for key "${key}":`, e);
            await redis_1.default.del(key);
        }
    }
    const functionResult = await functionIfNotFound();
    if (functionResult !== undefined) {
        await redis_1.default.set(key, JSON.stringify(functionResult), "EX", ttl);
    }
    metricsServer_1.cacheMisses.inc();
    return {
        cached: false,
        data: functionResult,
    };
};
exports.getCachedDataElse = getCachedDataElse;
/**
 * Get cached data only, no fallback logic.
 */
const getCache = async (key, hydrateModel) => {
    const cached = await redis_1.default.get(key);
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            metricsServer_1.cacheHits.inc();
            if (parsed === null) {
                return { cached: true, data: null };
            }
            const data = hydrateModel ? hydrateModel.hydrate(parsed) : parsed;
            return { cached: true, data };
        }
        catch (e) {
            console.warn(`Failed to parse cache for key "${key}":`, e);
            await redis_1.default.del(key);
        }
    }
    return {
        cached: false,
        data: null,
    };
};
exports.getCache = getCache;
//# sourceMappingURL=getCachedElse.js.map
//# debugId=4babf7c7-0a0d-5d32-a10c-936b27a75f2e
