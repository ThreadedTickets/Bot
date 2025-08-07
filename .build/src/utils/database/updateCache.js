"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="364d3197-19b0-5f9b-953b-37de80005671")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCachedData = void 0;
const logger_1 = __importDefault(require("../logger"));
const redis_1 = __importDefault(require("../redis"));
/**
 * Update cached data in Redis by recomputing it.
 *
 * @param key The Redis key to update
 * @param ttl The time to cache the result for in seconds
 * @param data The new data
 * @returns True if the data was successfully cached, otherwise false
 */
const updateCachedData = async (key, ttl, data) => {
    try {
        await redis_1.default.set(key, JSON.stringify(data), "EX", ttl);
        return true;
    }
    catch (error) {
        logger_1.default.error("Cache update error", error);
        return false;
    }
};
exports.updateCachedData = updateCachedData;
//# sourceMappingURL=updateCache.js.map
//# debugId=364d3197-19b0-5f9b-953b-37de80005671
