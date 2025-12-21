"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServerCache = void 0;
const updateCache_1 = require("../database/updateCache");
const toTimeUnit_1 = require("../formatters/toTimeUnit");
const updateServerCache = async (serverId, document) => {
    await (0, updateCache_1.updateCachedData)(`guilds:${serverId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 30), document.toObject());
};
exports.updateServerCache = updateServerCache;
//# sourceMappingURL=/src/utils/bot/updateServerCache.js.map