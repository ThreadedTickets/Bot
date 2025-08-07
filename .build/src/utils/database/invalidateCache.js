"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="92c65f10-7ebd-5ad2-a6b8-24e4fd049e8a")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateCache = void 0;
const redis_1 = __importDefault(require("../redis"));
const invalidateCache = async (key) => {
    await redis_1.default.del(key);
};
exports.invalidateCache = invalidateCache;
//# sourceMappingURL=invalidateCache.js.map
//# debugId=92c65f10-7ebd-5ad2-a6b8-24e4fd049e8a
