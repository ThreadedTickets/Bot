"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="ffbcbb45-9d08-5306-99d9-f590006fe520")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateCache = void 0;
const config_1 = __importDefault(require("../../config"));
const redis_1 = __importDefault(require("../redis"));
const invalidateCache = async (key) => {
    await redis_1.default.del(`${!key.includes("Creators:") ? config_1.default.redis.prefix : ""}${key}`);
};
exports.invalidateCache = invalidateCache;
//# sourceMappingURL=/src/utils/database/invalidateCache.js.map
//# debugId=ffbcbb45-9d08-5306-99d9-f590006fe520
