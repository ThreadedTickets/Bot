"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="df923631-e173-5be7-8bb2-ed4b870b9205")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDuration = formatDuration;
exports.parseDurationToMs = parseDurationToMs;
const logger_1 = __importDefault(require("../logger"));
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const parts = [];
    if (days > 0)
        parts.push(`${days}d`);
    if (hours % 24 > 0)
        parts.push(`${hours % 24}h`);
    if (minutes % 60 > 0)
        parts.push(`${minutes % 60}m`);
    if (seconds % 60 > 0 || parts.length === 0)
        parts.push(`${seconds % 60}s`);
    return parts.join(" ");
}
function parseDurationToMs(input, throwOnInvalid = false) {
    if (!input || typeof input !== "string") {
        logger_1.default.warn(`Invalid duration input, returned 60s: ${input}`);
        return 60 * 1000;
    }
    const units = {
        ms: ["ms", "msec", "msecs", "millisecond", "milliseconds"],
        s: ["s", "sec", "secs", "second", "seconds"],
        m: ["m", "min", "mins", "minute", "minutes"],
        h: ["h", "hr", "hrs", "hour", "hours"],
        d: ["d", "day", "days"],
        w: ["w", "week", "weeks"],
        M: ["M", "month", "months"],
        y: ["y", "yr", "yrs", "year", "years"],
    };
    const multipliers = {
        ms: 1,
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
        w: 7 * 24 * 60 * 60 * 1000,
        M: 30 * 24 * 60 * 60 * 1000,
        y: 365 * 24 * 60 * 60 * 1000,
    };
    const unitPatterns = Object.values(units)
        .flat()
        .map((u) => u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|");
    const regex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(${unitPatterns})`, "gi");
    let totalMs = 0;
    let matchedAny = false;
    let match;
    while ((match = regex.exec(input)) !== null) {
        matchedAny = true;
        const value = parseFloat(match[1]);
        const unitStr = match[2].toLowerCase();
        let multiplier = null;
        for (const [key, synonyms] of Object.entries(units)) {
            if (synonyms.includes(unitStr)) {
                multiplier = multipliers[key];
                break;
            }
        }
        if (multiplier === null) {
            logger_1.default.error(`Unknown time unit in parsing duration: ${unitStr}`);
            if (throwOnInvalid)
                throw new Error(`Unknown time unit: ${unitStr}`);
            continue;
        }
        const added = value * multiplier;
        totalMs += added;
    }
    // Look for bare numbers left after removing parsed patterns
    const stripped = input.replace(regex, "").trim();
    const bareNumberMatch = stripped.match(/^\d+(?:\.\d+)?$/);
    if (bareNumberMatch) {
        const fallbackValue = parseFloat(bareNumberMatch[0]);
        const fallbackMs = fallbackValue * multipliers.m;
        logger_1.default.debug(`Defaulted bare value "${fallbackValue}" to minutes = ${fallbackMs}ms when parsing duration`);
        totalMs += fallbackMs;
    }
    else if (!matchedAny) {
        logger_1.default.debug(`No valid duration parts found when parsing duration: "${input}"`);
        if (throwOnInvalid)
            throw new Error(`Invalid duration string: "${input}"`);
    }
    logger_1.default.debug(`Total duration parsed: ${totalMs}ms`);
    return totalMs;
}
//# sourceMappingURL=/src/utils/formatters/duration.js.map
//# debugId=df923631-e173-5be7-8bb2-ed4b870b9205
