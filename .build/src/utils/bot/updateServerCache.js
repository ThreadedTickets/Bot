"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="8fc16586-ffd4-5925-b077-f44b9ad5fad1")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServerCache = void 0;
const updateCache_1 = require("../database/updateCache");
const toTimeUnit_1 = require("../formatters/toTimeUnit");
const updateServerCache = async (serverId, document) => {
    await (0, updateCache_1.updateCachedData)(`guilds:${serverId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 30), document.toObject());
};
exports.updateServerCache = updateServerCache;
//# sourceMappingURL=/src/utils/bot/updateServerCache.js.map
//# debugId=8fc16586-ffd4-5925-b077-f44b9ad5fad1
