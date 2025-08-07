"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="9fd45b50-bd14-55b6-924f-8b94e3d41cba")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServerCache = void 0;
const updateCache_1 = require("../database/updateCache");
const toTimeUnit_1 = require("../formatters/toTimeUnit");
const updateServerCache = async (serverId, document) => {
    await (0, updateCache_1.updateCachedData)(`guilds:${serverId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 30), document.toObject());
};
exports.updateServerCache = updateServerCache;
//# sourceMappingURL=updateServerCache.js.map
//# debugId=9fd45b50-bd14-55b6-924f-8b94e3d41cba
